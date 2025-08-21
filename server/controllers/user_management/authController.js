// Import required modules
const jwt = require("jsonwebtoken"); // For generating and verifying JSON Web Tokens
const User = require("../../models/userModels"); // Mongoose model for the User
const sendEmail = require("../../utils/email"); // Utility function to send emails
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { asyncHandler } = require("../../middleware/asyncHandler");
const generateAccessToken = require("../../utils/generateAccessToken");
const generateRefreshToken = require("../../utils/generateRefreshToken");
const { userSchema } = require("../../joiSchemas/authSchema");

// Load the secret key for signing email verification tokens from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Registers a new user and sends an email verification link.
 */
exports.registerUser = asyncHandler(async (req, res) => {
  // Validate input shape and format
  const validateData = await userSchema.validateAsync(req.body);

  // Destructure user input from request body
  const { email, password, confirmPassword, firstName, lastName } =
    validateData;
  if (!email || !password || !confirmPassword || !firstName || !lastName) {
    throw new Error("Please fill in all fields");
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({
      message: "Passwords do not match",
      error: true,
    });
  }

  // Check if a user with the given email already exists in the database
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // If email already exists, return a 400 Bad Request response
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user document
  const user = new User({
    email,
    password: hashedPassword,
    firstName,
    lastName,
  });

  // Save the new user to the database
  await user.save();

  // Generate a JWT token with the user's ID as payload, signed with EMAIL_SECRET, expires in 1 day
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: "1d",
  });

  // Create a link that the user will click to verify their email
  const verifyLink = `http://localhost:5000/api/auth/verify-email?token=${token}`;

  // Send the email to the user with the verification link
  await sendEmail(
    email,
    "Verify Your Email",
    `<p>Please click <a href="${verifyLink}">this link</a> to verify your email</p>`
  );

  // Respond with a 201 Created status and a success message
  res.status(201).json({ message: "User registered, verification email sent" });
});

/**
 * Verifies the user's email using the token from the query string.
 */
exports.verifyEmail = asyncHandler(async (req, res) => {
  // Extract the token from the query parameters
  const { token } = req.query;

  try {
    // Verify the token using the same EMAIL_SECRET
    const { userId } = jwt.verify(token, JWT_SECRET);

    // If token is valid, update the user in the database to set isVerified to true
    await User.findByIdAndUpdate(userId, { isVerified: true });

    // Respond with a success message
    res.redirect("https://e-commerce-zk07.onrender.com/email-verified");
  } catch (error) {
    // If the token is invalid or expired, return a 400 Bad Request error
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

/**
 * Logs in a user by validating credentials and issuing tokens.
 * - Sends access token in response
 * - Sets refresh token as HTTP-only cookie
 */
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if a user exists with the given email
  const user = await User.findOne({ email }).select("+password");

  // If user doesn't exist or password is invalid, return 401
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid password/email" });
  }

  // Prevent login if the user hasn't verified their email
  if (!user.isVerified) {
    return res.status(403).json({
      message: "Your account has not been verified.",
    });
  }

  // Prevent login if the user is "suspended"
  if (user.status === "suspended") {
    return res.status(403).json({
      message:
        "Your account has been suspended. If you believe this is in error, please contact the admin.",
    });
  }

  // Generate short-lived access token
  const accessToken = generateAccessToken(user._id);

  // Generate long-lived refresh token
  const refreshToken = generateRefreshToken(user._id);

  const userObj = user.toObject();
  delete userObj.password;

  // Send access token and basic user info in response
  res.status(200).json({
    accessToken,
    refreshToken,
    user: userObj,
  });
});

/**
 * Logs out the user by clearing the refresh token cookie.
 */
exports.logoutUser = asyncHandler(async (req, res) => {
  // Send success response
  res.status(200).json({ message: "Logged out successfully" });
});

/**
 * Refreshes the access token using a valid refresh token from cookies.
 * - Returns a new access token if the refresh token is valid
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  // Get refresh token from cookies
  const { refreshToken: token } = req.body;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new access token
    const accessToken = generateAccessToken(decoded.userId);

    // Send the new access token in response
    res.status(200).json({
      accessToken,
      user,
    });
  } catch (err) {
    // If token is invalid or expired
    res.status(403).json({ message: "Invalid refresh token" });
  }
});

/**
 * Forgot Password Handler
 * This function is triggered when a user requests to reset their password via email.
 * asyncHandler is used to handle exceptions in async code without try-catch blocks
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  // Step 1: Find user by email provided in the request body
  const user = await User.findOne({ email: req.body.email });

  // If no user exists with that email, send a 404 response
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!user.isVerified) {
    return res.status(400).json({ message: "Please verify your email first." });
  }

  // Step 2: Generate a unique reset token using crypto
  // crypto.randomBytes(20) creates 20 random bytes
  // .toString("hex") converts it into a readable hexadecimal string
  const token = crypto.randomBytes(20).toString("hex");

  // Step 3: Hash the token for secure storage in the database
  // The plain token will be sent to the user, but we store the hashed version
  // This prevents misuse if someone gets access to the database
  user.resetPasswordToken = crypto
    .createHash("sha256") // Hashing algorithm
    .update(token) // Apply it to the raw token
    .digest("hex"); // Output format

  // Step 4: Set an expiry time for the token (15 minutes from now)
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

  // Save the token and expiry time to the user's record
  await user.save();

  // Step 5: Create a password reset URL using the plain token
  // This URL will be sent in the email, and the user will click it to reset their password
  const resetUrl = `https://e-commerce-zk07.onrender.com/reset-password/${token}`;

  // console.log("Raw token", token);
  // console.log("Reset token", resetUrl);

  // Step 6: Send the email with the reset link to the user
  // The sendEmail function handles SMTP logic (likely using Nodemailer)

  await sendEmail(
    user.email, // Recipient
    "Password Reset", // Subject
    `Reset your password: <a href="${resetUrl}">here</a>` // Email content
  );

  // Step 7: Respond with a success message
  res.status(200).json({
    message:
      "If an account with that email exists, a reset link has been sent.",
  });
});

/** Reset Password Handler
 * This route is hit when a user clicks the password reset link and submits a new password.
 * asyncHandler handles any thrown errors without a try/catch block
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  // Step 1: Hash the token received from the URL
  // The token in the URL is the plain version. We hash it so it can be matched with the one stored in the DB
  const hashedToken = crypto
    .createHash("sha256") // Use SHA-256 algorithm
    .update(req.params.token) // Hash the raw token from the URL
    .digest("hex"); // Convert to hex for consistency with DB storage

  // Step 2: Look for a user with the hashed token AND a valid (non-expired) expiry timestamp
  const user = await User.findOne({
    resetPasswordToken: hashedToken, // Compare hashed tokens
    resetPasswordExpires: { $gt: Date.now() }, // Ensure token is not expired
  });

  // Step 3: If user not found or token is invalid/expired, return an error
  if (!user)
    return res.status(400).json({ message: "Token is invalid or expired" });

  if (req.body.password !== req.body.confirmPassword) {
    return res
      .status(400)
      .json({ message: "Password and Confirm Password do not match." });
  }

  // Step 4: Hash the new password using bcrypt with a salt round of 10
  user.password = await bcrypt.hash(req.body.password, 10);

  // Step 5: Clear the reset token and expiration fields
  // This prevents reuse of the token and finalizes the reset
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  // Step 6: Save the updated user document (with new password)
  await user.save();

  // Step 7: Respond with success message
  res.json({ message: "Password updated successfully." });
});

// @desc    Resend the verification email to users who haven't verified yet
// @route   POST /api/auth/resend-verification
// @access  Public (email only)
exports.resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Step 1: Validate email presence
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Step 2: Find the user by email
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Step 3: Check if the user is already verified
  if (user.isVerified) {
    return res
      .status(400)
      .json({ message: "This account has already been verified." });
  }

  // Step 4: Generate a new verification token using JWT
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Step 5: Compose the email verification URL (to your frontend)
  const verificationUrl = `https://e-commerce-zk07.onrender.com/verify-email/${token}`;

  // Step 6: Send email with the new verification link
  await sendEmail({
    to: user.email,
    subject: "Verify Your Account - New Link",
    html: `
      <h2>Hello ${user.firstName || "there"},</h2>
      <p>You requested a new verification link. Please click below to verify your account:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in 1 hour.</p>
    `,
  });

  // Step 7: Respond with confirmation
  res.status(200).json({ message: "Verification email resent successfully." });
});
