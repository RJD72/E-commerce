const Joi = require("joi");

exports.reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().min(3).max(500).required(),
});
