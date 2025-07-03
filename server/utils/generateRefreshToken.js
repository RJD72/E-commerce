const jwt = require("jsonwebtoken");

/**
 * Generates a long-lived refresh token.
 * This token will be stored in a secure HTTP-only cookie and used to get new access tokens.
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d", // Refresh token valid for 7 days
  });
};

module.exports = generateRefreshToken;
