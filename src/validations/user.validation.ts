import Joi from "joi";
import { AgentApprovalStatus, UserRole, UserStatus } from "@prisma/client";

import { commonVariables, userMessages } from "@constants";
import { commonHandler } from "@utils";

/* Add User Schema */
export const addUserValidation = {
  body: Joi.object({
    role: Joi.string()
      .required()
      .custom((value, helpers) => {
        try {
          return commonHandler.toUpperAndValidateEnums(value);
        } catch (err) {
          return helpers.error("any.invalid");
        }
      })
      .optional()
      .messages({
        "any.invalid": `role must be one of [${UserRole.INVESTOR.toLowerCase()}, ${UserRole.AGENT.toLowerCase()}]`,
      }),
    email: Joi.string()
      .required()
      .email({ tlds: { allow: false } })
      .max(commonVariables.EMAIL_MAX_LENGTH),
    first_name: Joi.string()
      .required()
      .max(commonVariables.NAME_MAX_LENGTH)
      .pattern(commonVariables.NAME_REGEX) // Only letters and spaces
      .message(userMessages.ONLY_LETTERS_ALLOWED("First name")),
    last_name: Joi.string()
      .required()
      .max(commonVariables.NAME_MAX_LENGTH)
      .pattern(commonVariables.NAME_REGEX) // Only letters and spaces
      .message(userMessages.ONLY_LETTERS_ALLOWED("Last name")),
  }).unknown(false),
};

/* Add Update Schema */
export const updateUserSchema = {
  body: Joi.object({
    role: Joi.string()
      .required()
      .custom((value, helpers) => {
        try {
          return commonHandler.toUpperAndValidateEnums(value);
        } catch (err) {
          return helpers.error("any.invalid");
        }
      })
      .optional()
      .messages({
        "any.invalid": `role must be one of [${UserRole.INVESTOR.toLowerCase()}, ${UserRole.AGENT.toLowerCase()},${UserRole.ADMIN.toLowerCase()}]`,
      }),
    first_name: Joi.string()
      .max(commonVariables.NAME_MAX_LENGTH)
      .pattern(commonVariables.NAME_REGEX) // Only letters and spaces
      .message(userMessages.ONLY_LETTERS_ALLOWED("First name")),
    last_name: Joi.string()
      .max(commonVariables.NAME_MAX_LENGTH)
      .pattern(commonVariables.NAME_REGEX) // Only letters and spaces
      .message(userMessages.ONLY_LETTERS_ALLOWED("Last name")),
  }).unknown(false),
};

/* Forgot Password Schema */
export const forgetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

/* Resend Invitation Schema */
export const resendInvitationSchema = {
  body: Joi.object({
    user_id: Joi.number().required(),
  }),
};

/* Update Status Schema */
export const updateStatusSchema = {
  body: Joi.object({
    status: Joi.string()
      .valid(UserStatus.ACTIVE, UserStatus.INACTIVE)
      .required(),
  }),
};
/* Update Status Schema */
export const updateAgentStatusSchema = {
  body: Joi.object({
    status: Joi.string()
      .valid(
        AgentApprovalStatus.APPROVED,
        AgentApprovalStatus.PENDING,
        AgentApprovalStatus.REJECTED
      )
      .required(),
  }),
};

export const createInvestorProfileValidation = {
  body: Joi.object({
    budget_unit: Joi.string()
      .required()
      .custom((value, helpers) => {
        try {
          return commonHandler.toUpperAndValidateEnums(value);
        } catch (err) {
          return helpers.error("any.invalid");
        }
      })
      .messages({
        "any.invalid":
          "Budegt unit must be one of [LAKH, CRORE]",
      }),
    budget_min: Joi.number().required().min(0),
    budget_max: Joi.number()
      .required()
      .greater(Joi.ref("budget_min"))
      .messages({
        "any.only": "Maximum budget must be greater than minimum budget",
        "number.greater": "Maximum budget must be greater than minimum budget",
      }),
    risk_tolerance: Joi.string()
      .required()
      .custom((value, helpers) => {
        try {
          return commonHandler.toUpperAndValidateEnums(value);
        } catch (err) {
          return helpers.error("any.invalid");
        }
      })
      .messages({
        "any.invalid": "Risk tolerance must be one of [LOW, MEDIUM, HIGH]",
      }),
    investment_horizon: Joi.string()
      .required()
      .custom((value, helpers) => {
        try {
          return commonHandler.toUpperAndValidateEnums(value);
        } catch (err) {
          return helpers.error("any.invalid");
        }
      })
      .messages({
        "any.invalid":
          "Investment horizon must be one of [SHORT, MEDIUM, LONG]",
      }),
    primary_objective: Joi.string()
      .required()
      .custom((value, helpers) => {
        try {
          return commonHandler.toUpperAndValidateEnums(value);
        } catch (err) {
          return helpers.error("any.invalid");
        }
      })
      .messages({
        "any.invalid":
          "Primary objective must be one of [YIELD, APPRECIATION, LIFESTYLE, DIVERSIFICATION]",
      }),
    ownership_structure: Joi.string()
      .required()
      .custom((value, helpers) => {
        try {
          return commonHandler.toUpperAndValidateEnums(value);
        } catch (err) {
          return helpers.error("any.invalid");
        }
      })
      .messages({
        "any.invalid":
          "Ownership structure must be one of [SOLE, JOINT, FRACTIONAL, LEASEBACK]",
      }),
    country: Joi.string().required(),
    state: Joi.string().required(),
    cities: Joi.array().items(Joi.string()).min(1).required().messages({
      "array.min": "Select at least one city",
    }),
    preferred_property_types: Joi.string().required(),
    tourism_preferences: Joi.string().required(),
    renovation_willingness: Joi.string()
      .required()
      .custom((value, helpers) => {
        try {
          return commonHandler.toUpperAndValidateEnums(value);
        } catch (err) {
          return helpers.error("any.invalid");
        }
      })
      .messages({
        "any.invalid":
          "Renovation willingness must be one of [TURNKEY,LIGHT, FULL]",
      }),
  }).unknown(false),
};

export const createAgentProfileValidation = {
  body: Joi.object({
    company_name: Joi.string()
      .optional()
      .allow(null, "")
      .min(3)
      .max(50)
      .messages({
        "string.min": "Company name must be at least 3 characters",
        "string.max": "Company name must be at most 50 characters",
      }),
    contact_number: Joi.string()
      .required()
      .pattern(commonVariables.ONLY_NUMBER_REGEX)
      .min(10)
      .max(20)
      .messages({
        "string.empty": "Contact number is required",
        "string.pattern.base": "Contact number must contain digits only",
        "string.min": "Contact number must be at least 10 digits",
        "string.max": "Contact number must be at most 20 digits",
      }),

    license_number: Joi.string()
      .required()
      .pattern(commonVariables.ONLY_NUMBER_REGEX)
      .min(5)
      .max(20)
      .messages({
        "string.empty": "License number is required",
        "string.pattern.base": "License number must contain digits only",
        "string.min": "License number must be at least 5 digits",
        "string.max": "License number must be at most 20 digits",
      }),
  }).unknown(false),
};
