const Joi = require("joi");

// Schema for a single product
const singleProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name is required",
    "any.required": "Product name is required",
  }),

  description: Joi.string().min(10).required().messages({
    "string.empty": "Description is required",
    "any.required": "Product description is required",
  }),

  brand: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Brand is required",
    "any.required": "Product brand is required",
  }),

  price: Joi.string()
    .pattern(/^\d+(\.\d{1,2})?$/)
    .required()
    .messages({
      "string.empty": "Price is required",
      "string.pattern.base": "Price must be a valid amount (e.g. 19.99)",
    }),

  category: Joi.string().required().messages({
    "string.empty": "Category is required",
  }),

  stock: Joi.number().integer().min(0).required().messages({
    "number.base": "Stock must be a number",
    "any.required": "Stock quantity is required",
  }),

  images: Joi.array().items(Joi.string().uri()).min(1).required().messages({
    "array.min": "At least one image URL is required",
    "string.uri": "Each image must be a valid URL",
  }),

  isFeatured: Joi.boolean().optional(),

  createdAt: Joi.date().optional(), // usually not required on input, but harmless if included
});

// Export schemas for validating single or multiple products
exports.productSchema = singleProductSchema;

exports.productArraySchema = Joi.array()
  .items(singleProductSchema)
  .min(1)
  .messages({
    "array.min": "At least one product must be submitted",
  });
