import Joi from "joi";

export const idSchema = Joi.object({
  id: Joi.number().integer().positive(),
  user_id: Joi.number().integer().positive(),
}).xor("user_id", "id");
