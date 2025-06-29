const Joi = require("joi");

exports.userSchema = Joi.object({
  // Personal Info
  firstName: Joi.string().min(3).max(30).required(),
  lastName: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),

  // Password validation: at least 1 lowercase, 1 uppercase, 1 digit, 1 special char, 8-64 chars
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,64}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.",
    }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match.",
  }),

  // Optional role (primarily for admin use)
  role: Joi.string().valid("user", "admin").optional(),

  // Optional contact info
  phone: Joi.string()
    .pattern(/^[\d\s\-().+]{7,20}$/)
    .optional(),

  // Optional profile image URL
  profileImage: Joi.string().uri().optional(),

  // Shipping Address
  shippingAddress: Joi.object({
    street: Joi.string().allow("", null),
    city: Joi.string().allow("", null),
    province: Joi.string().allow("", null),
    postalCode: Joi.string().allow("", null),
    country: Joi.string().default("Canada").allow("", null),
  }).optional(),

  // Billing Address
  billingAddress: Joi.object({
    street: Joi.string().allow("", null),
    city: Joi.string().allow("", null),
    province: Joi.string().allow("", null),
    postalCode: Joi.string().allow("", null),
    country: Joi.string().default("Canada").allow("", null),
  }).optional(),

  // Wishlist and Cart can be empty arrays or omitted entirely
  cart: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().hex().length(24).required(),
        quantity: Joi.number().min(1).default(1),
      })
    )
    .optional(),

  wishList: Joi.array().items(Joi.string().hex().length(24)).optional(),

  orders: Joi.array().items(Joi.string().hex().length(24)).optional(),

  // You likely won't use these from the client, but added here for completeness
  resetPasswordToken: Joi.string().optional(),
  resetPasswordExpires: Joi.date().optional(),
});

exports.updateUserSchema = Joi.object({
  // All fields are optional for update
  firstName: Joi.string().min(3).max(30).optional(),
  lastName: Joi.string().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid("user", "admin").optional(),
  phone: Joi.string()
    .pattern(/^[\d\s\-().+]{7,20}$/)
    .optional(),
  profileImage: Joi.string().uri().optional(),

  shippingAddress: Joi.object({
    street: Joi.string().allow("", null),
    city: Joi.string().allow("", null),
    province: Joi.string().allow("", null),
    postalCode: Joi.string().allow("", null),
    country: Joi.string().allow("", null),
  }).optional(),

  billingAddress: Joi.object({
    street: Joi.string().allow("", null),
    city: Joi.string().allow("", null),
    province: Joi.string().allow("", null),
    postalCode: Joi.string().allow("", null),
    country: Joi.string().allow("", null),
  }).optional(),

  cart: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().hex().length(24).required(),
        quantity: Joi.number().min(1).default(1),
      })
    )
    .optional(),

  wishList: Joi.array().items(Joi.string().hex().length(24)).optional(),
  orders: Joi.array().items(Joi.string().hex().length(24)).optional(),

  // Password validation only if present
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,64}$/)
    .messages({
      "string.pattern.base":
        "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.",
    })
    .optional(),

  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .when("password", {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "any.only": "Passwords do not match.",
    }),
});
