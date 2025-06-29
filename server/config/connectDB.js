// Import the Mongoose library for interacting with MongoDB
const mongoose = require("mongoose");

// Define an asynchronous function to establish a connection to the MongoDB database
async function connectDB() {
  try {
    // Access the current Mongoose connection instance
    const connection = mongoose.connection;

    // Event listener for successful connection to MongoDB
    connection.on("connected", () => {
      console.log("Connected to MongoDB");
    });

    // Event listener for any error that occurs on the connection
    connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    // Attempt to connect to MongoDB using the URI from environment variables
    // This is typically something like: mongodb+srv://username:password@cluster.mongodb.net/dbname
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    // Catch and log any error that occurs during the connection process
    console.error("Something went wrong connecting to the database", error);
  }
}

// Export the connectDB function so it can be used in other files (like server.js or app.js)
module.exports = connectDB;

// ### Suggestions for improvement:

// 1. **Add a `.once('open')` listener** if you want to handle one-time success events.
// 2. **Improve error logging** inside `connection.on("error", ...)` by including the error object:

//    connection.on("error", (err) => {
//      console.error("MongoDB connection error:", err);
//    });

// 3. **Add connection options** to `mongoose.connect()` (e.g., `useNewUrlParser`, `useUnifiedTopology`) if needed for compatibility or configuration.
