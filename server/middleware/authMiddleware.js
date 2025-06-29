// Import required modules
const jwt = require("jsonwebtoken"); // Used to verify JWT tokens
const User = require("../models/userModels"); // Mongoose model for User
const asyncHandler = require("./asyncHandler"); // Utility to catch async errors automatically

/**
 * Middleware to authenticate users using JWT stored in cookies.
 * Protects routes by ensuring the user has a valid token.
 */
/**
 * Middleware to protect routes.
 * Checks for a valid access token in the Authorization header.
 * If valid, attaches user info to `req.user`; otherwise blocks the request.
 */
exports.authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Ensure token exists and is in Bearer format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    // Extract token string
    const token = authHeader.split(" ")[1];

    // Verify and decode token using access token secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to the request (excluding password)
    req.user = await User.findById(decoded.userId).select("-password");

    next(); // Continue to next middleware or route handler
  } catch (error) {
    // If token is expired or invalid
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

/**
 * Middleware to authorize only admin users.
 * Assumes that `authenticate` middleware ran first and set `req.user`.
 */
exports.authorizeAdmin = (req, res, next) => {
  // Check if user exists and has admin privileges
  if (req.user && req.user.role === "admin") {
    next(); // User is admin, proceed
  } else {
    // User is not authorized
    res.status(403).json({ message: "Not authorized" });
  }
};
