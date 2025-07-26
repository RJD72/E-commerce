const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");
const { asyncHandler } = require("../../middleware/asyncHandler");
const cloudinary = require("../../utils/cloudinary");
const stream = require("stream");
const validator = require("validator");
const mongoose = require("mongoose");

// @desc    Admin creates a new product with uploaded image
// @route   POST /api/admin/products
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res) => {
  // SECTION 1: INITIAL SETUP AND INPUT VALIDATION
  const {
    name,
    description,
    brand,
    price,
    category,
    stock,
    isFeatured = false,
  } = req.body;

  const isFeaturedBool = isFeatured === "true" || isFeatured === true;

  if (!mongoose.Types.ObjectId.isValid(category)) {
    return res.status(400).json({ message: "Invalid category Id" });
  }

  const categoryExists = await Category.exists({ _id: category });
  if (!categoryExists) {
    return res.status(400).json({ message: "Category not found" });
  }

  // Initialize image list
  let imageList = [];

  // SECTION 2: IMAGE HANDLING - Only handle files now
  if (req.files?.length > 0) {
    const validMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await Promise.all(
        req.files.map(async (file) => {
          if (!validMimeTypes.includes(file.mimetype)) {
            throw new Error(`Invalid file type: ${file.originalname}`);
          }

          if (file.size > 5 * 1024 * 1024) {
            throw new Error(`File too large: ${file.originalname}`);
          }

          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "products",
                resource_type: "auto",
                quality: "auto:good",
                format: "webp",
                transformation: [
                  { width: 1600, crop: "limit" },
                  { quality: "auto" },
                ],
              },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary upload error:", error);
                  reject(new Error(`Upload failed for ${file.originalname}`));
                } else {
                  resolve(result);
                }
              }
            );

            uploadStream.end(file.buffer);
          });

          imageList.push(result.secure_url);
        })
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error("File upload transaction aborted:", error);

      if (imageList.length > 0) {
        await cleanupCloudinaryResources(imageList);
      }

      return res.status(400).json({
        message: "Product creation failed during image upload",
        error: error.message,
      });
    } finally {
      session.endSession();
    }
  }

  // SECTION 3: PRODUCT VALIDATION
  if (
    !validator.isLength(name, { min: 3 }) ||
    !validator.isLength(description, { min: 10 }) ||
    !validator.isFloat(price.toString(), { gt: 0 }) ||
    !validator.isInt(stock.toString(), { gt: -1 }) ||
    imageList.length === 0
  ) {
    return res.status(400).json({
      message: "Invalid product data",
      details: {
        name: validator.isLength(name, { min: 3 }) ? "Valid" : "Too short",
        description: validator.isLength(description, { min: 10 })
          ? "Valid"
          : "Too short",
        price: validator.isFloat(price.toString(), { gt: 0 })
          ? "Valid"
          : "Must be > 0",
        stock: validator.isInt(stock.toString(), { gt: -1 })
          ? "Valid"
          : "Must be ≥ 0",
        images: imageList.length === 0 ? "At least one required" : "Valid",
      },
    });
  }

  // SECTION 4: PRODUCT CREATION
  try {
    const product = new Product({
      name: validator.escape(validator.trim(name)),
      description: validator.escape(validator.trim(description)),
      brand: validator.escape(validator.trim(brand)),
      price: parseFloat(price).toFixed(2),
      category: category,
      stock: parseInt(stock),
      images: imageList,
      isFeatured: isFeaturedBool,
    });

    const savedProduct = await product.save();

    return res.status(201).json({
      success: true,
      data: {
        id: savedProduct._id,
        name: savedProduct.name,
        price: savedProduct.price,
        images: savedProduct.images,
      },
    });
  } catch (error) {
    console.error("Database save error:", error);

    if (imageList.length > 0) {
      await cleanupCloudinaryResources(imageList);
    }

    return res.status(500).json({
      message: "Product creation failed",
      error: error.message,
    });
  }
});

/**
 * HELPER FUNCTION: Cleanup Cloudinary Resources
 * Deletes uploaded images if product creation fails
 */
async function cleanupCloudinaryResources(urls) {
  try {
    await Promise.all(
      urls.map(async (url) => {
        if (url.includes("res.cloudinary.com")) {
          const publicId = url.split("/").slice(-2).join("/").split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        }
      })
    );
  } catch (cleanupError) {
    console.error("Cleanup failed:", cleanupError);
  }
}

// @desc    Admin updates a product by its ID
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
exports.updateProductByIdAdmin = asyncHandler(async (req, res) => {
  // STEP 1: Check if product ID is valid
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  // STEP 2: Find the existing product
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // STEP 3: Get data from request
  const {
    name,
    description,
    brand,
    price,
    category,
    stock,
    isFeatured,
    imageUrls = [], // Default empty array if not provided
  } = req.body;

  if (category && !mongoose.Types.ObjectId.isValid(category)) {
    return res.status(400).json({ message: "Invalid category ID" });
  }

  if (category) {
    const categoryExists = await Category.exists({ _id: category });
    if (!categoryExists) {
      return res.status(400).json({ message: "Category not found" });
    }
  }

  // STEP 4: Handle images
  let imageList = [...product.images]; // Start with existing images

  // Option A: If new URLs provided, use those instead
  if (Array.isArray(imageUrls) && imageUrls.length > 0) {
    imageList = [...imageUrls]; // Replace with new URLs
  }

  // Option B: If files uploaded, upload to Cloudinary
  if (req.files?.length > 0) {
    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        // Simple file validation
        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit
          return reject(new Error("File too large"));
        }

        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );

        const bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);
        bufferStream.pipe(uploadStream);
      });
    });

    try {
      const newUrls = await Promise.all(uploadPromises);
      imageList = [...newUrls]; // Replace with new uploads
    } catch (error) {
      return res.status(400).json({
        message: "File upload failed",
        error: error.message,
      });
    }
  }

  // STEP 5: Update product data
  product.name = name || product.name;
  product.description = description || product.description;
  product.brand = brand || product.brand;
  product.price = price || product.price;
  product.category = category || product.category;
  product.stock = stock ?? product.stock;
  product.isFeatured = isFeatured ?? product.isFeatured;
  product.images = imageList; // Update images if changed

  // STEP 6: Save and respond
  try {
    const updatedProduct = await product.save();
    res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
});

// @desc    Admin deletes a product by its ID
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
exports.deleteProductByIdAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params; // Extract product ID from the route parameter

  // Find the product by ID in the database
  const product = await Product.findById(id);

  // If product doesn't exist, return a 404 error
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // If found, delete the product document
  await product.deleteOne();

  // Respond with a success message
  res.status(200).json({ message: "Product deleted successfully" });
});
