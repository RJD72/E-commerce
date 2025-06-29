// Import the multer library which handles multipart/form-data, primarily used for file uploads
const multer = require("multer");

// Configure how files should be stored
// Using memoryStorage means files will be stored in memory as Buffer objects
// instead of being saved to disk. This is useful when you want to process
// the file (e.g., upload to Cloudinary) without saving it locally first
const storage = multer.memoryStorage();

// Define a file filter function to control which files are accepted
// This function gets called for each file that's being uploaded
const fileFilter = (req, file, cb) => {
  // Check if the file's MIME type starts with "image/"
  // This ensures we only accept image files (like jpeg, png, gif, etc.)
  if (file.mimetype.startsWith("image/")) {
    // If it's an image file, call the callback with 'true' to accept the file
    // The first parameter is for errors (null means no error)
    cb(null, true);
  } else {
    // If it's not an image file, create an error and call the callback with 'false'
    // This will reject the file and pass an error to the request
    cb(new Error("Only image files are allowed"), false);
  }
};

// Create the multer middleware instance with our configuration
// We pass both the storage and fileFilter configurations
// This will return middleware functions that can process file uploads
const upload = multer({
  storage, // Use our memory storage configuration
  fileFilter, // Use our custom file filter
});

// Export the configured multer middleware so it can be used in other files
// Typically used in routes like: router.post('/upload', upload.single('image'), ...)
module.exports = upload;
