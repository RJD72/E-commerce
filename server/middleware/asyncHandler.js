// Define a higher-order function named asyncHandler
// It takes one argument: `fn`, which is an async function (typically a controller or middleware)
exports.asyncHandler = (fn) => (req, res, next) => {
  // Call the async function `fn` with Express's request, response, and next arguments
  // Wrap the call in `Promise.resolve()` to ensure it behaves like a Promise even if `fn` is not explicitly marked async
  Promise.resolve(fn(req, res, next)).catch((error) => {
    // If the promise is rejected (i.e., an error occurs in the async function),
    // catch the error and send a generic 500 response with the error message
    res.status(500).json({ message: error.message });

    // Note: Alternatively, you could use `next(error)` here to delegate to Express's global error handler
    // That would be more flexible for centralized logging and custom error responses
  });
};

// Export the asyncHandler function so it can be used in other parts of the application
// module.exports = asyncHandler;
