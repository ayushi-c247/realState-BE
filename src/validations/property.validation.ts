import { VisibilityStatus } from "@prisma/client";
import Joi from "joi";

export const updatePropertyVisiblityStatusSchema = {
  body: Joi.object({
    status: Joi.string()
      .valid(VisibilityStatus.ACTIVE, VisibilityStatus.INACTIVE)
      .required(),
  }),
};
