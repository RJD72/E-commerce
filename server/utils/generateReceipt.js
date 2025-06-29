// utils/generateReceipt.js

// Import required libraries:
// PDFDocument for creating PDF documents
// fs (file system) for writing files to disk
const PDFDocument = require("pdfkit");
const fs = require("fs");

/**
 * Generates a PDF receipt for an order
 * @param {Object} order - The order object containing order details
 * @param {string} filePath - The path where the PDF receipt will be saved
 */
const generateReceipt = (order, filePath) => {
  // Create a new PDF document instance
  const doc = new PDFDocument();

  // Pipe the PDF output to a writable stream (to save as a file)
  doc.pipe(fs.createWriteStream(filePath));

  // Add the title "Order Receipt" centered at the top of the document
  doc.fontSize(20).text("Order Receipt", { align: "center" });
  doc.moveDown(); // Move down to create space after the title

  // Add order details with smaller font size (12pt)
  doc.fontSize(12).text(`Order ID: ${order._id}`); // Display the order ID
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`); // Format and display order date
  // Convert totalAmount from cents to dollars (assuming order.totalAmount is in cents)
  doc.text(`Total: $${(order.totalAmount / 100).toFixed(2)}`);
  doc.text(`Payment Status: ${order.status}`); // Display payment status
  doc.moveDown(); // Add space after order details

  // Add items section header
  doc.text("Items:");

  // Loop through each item in the order and display its details
  order.items.forEach((item, index) => {
    doc.text(
      // Display item number, product ID, and quantity
      `${index + 1}. Product ID: ${item.product} | Quantity: ${item.quantity}`
    );
  });

  // Finalize the PDF and end the document
  doc.end();
};

// Export the generateReceipt function so it can be used in other files
module.exports = generateReceipt;
