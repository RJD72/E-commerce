const jwt = require("jsonwebtoken");

/**
 * Generates a short-lived access token.
 * This token will be used to authorize API requests.
 * Typically stored in memory or in an Authorization header on the frontend.
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15m", // Access token valid for 15 minutes
  });
};

module.exports = generateAccessToken;
