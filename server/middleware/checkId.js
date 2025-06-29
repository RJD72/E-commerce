// Importing the helper function from Mongoose to check for valid ObjectId strings.
// This is essential for verifying that the product ID in the request is in the correct format.
const { isValidObjectId } = require("mongoose");

// Middleware to validate the product ID provided in the route parameter (e.g., POST /products/:id/reviews)
function checkId(req, res, next) {
  // Check if the ID in the URL params (req.params.id) is a valid MongoDB ObjectId
  if (!isValidObjectId(req.params.id)) {
    // If it's not valid, respond with HTTP 404 Not Found
    res.status(404);

    // Throw a descriptive error. This will be caught by error-handling middleware like express-async-handler
    throw new Error(`Invalid ObjectId: ${req.params.id}`);
  }

  // If the ID is valid, pass control to the next middleware or the controller (e.g., addReview)
  next();
}

// Exporting the middleware so it can be used in routes (e.g., POST /products/:id/reviews)
module.exports = checkId;
