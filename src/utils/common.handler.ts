import * as crypto from "crypto";
// Internal modules
import env from "@config/envVar";
// Constants
import { commonMessages, commonVariables, TOO_MANY_REQUESTS } from "@constants";
// Types
import type { AuthTokenPayload } from "@customTypes";
import jwt from "jsonwebtoken";
export const isLogger = env.NODE_ENV === "development";

import dayjs from "dayjs";
import rateLimit from "express-rate-limit";
import utc from "dayjs/plugin/utc";
import { ALL_ENUMS } from "@enums";
import { Prisma, UserRole } from "@prisma/client";

dayjs.extend(utc);

/**
 * Verifies a JWT token using a secret key.
 *
 * @param {string} token - The JWT token to verify.
 * @param {string} secret - The secret key to use for verification.
 * @returns {Promise<AuthTokenPayload>} - A promise that resolves to the decoded payload,
 *   or rejects with an error if the token is invalid.
 */
export const verifyJwt = (
  token: string,
  secret: string
): Promise<AuthTokenPayload> =>
  new Promise((resolve, reject) =>
    jwt.verify(token, secret, (err, decoded) => {
      if (err || typeof decoded !== "object" || !("role" in decoded)) {
        return reject(err || new Error(commonMessages.INVALID_TOKEN));
      }
      resolve(decoded as AuthTokenPayload);
    })
  );

/**
 * Converts a time duration from one unit to another.
 * @param {number} duration The duration of time in the given unit.
 * @param {string} fromUnit The unit that the given duration is in.
 * @param {string} toUnit The unit to convert the duration to.
 * @returns {number} The duration of time in the given unit.
 * @throws {Error} If either the fromUnit or toUnit is not a valid unit.
 */
export const convertTime = async (
  duration: number,
  fromUnit: string,
  toUnit: string
) => {
  // Time conversion units in milliseconds
  const unitsInMilliseconds: { [key: string]: number } = {
    year: 365 * 24 * 60 * 60 * 1000, // 1 year = 365 days in milliseconds
    month: 30 * 24 * 60 * 60 * 1000, // 1 month = 30 days in milliseconds
    day: 24 * 60 * 60 * 1000, // 1 day = 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
    hour: 60 * 60 * 1000, // 1 hour = 60 minutes * 60 seconds * 1000 milliseconds
    minute: 60 * 1000, // 1 minute = 60 seconds * 1000 milliseconds
    second: 1000, // 1 second = 1000 milliseconds
    millisecond: 1, // 1 millisecond
  };

  // Normalize units to lowercase to handle case-insensitivity
  const fromUnitLower = fromUnit.toLowerCase();
  const toUnitLower = toUnit.toLowerCase();

  // Check if the provided units are valid
  if (!unitsInMilliseconds[fromUnitLower]) {
    throw new Error(
      `${commonMessages.INVALID_FROM_UNIT} "${fromUnit}". ${commonMessages.SUPPORTED_TIME_UNITS}`
    );
  }

  if (!unitsInMilliseconds[toUnitLower]) {
    throw new Error(
      `${commonMessages.INVALID_TO_UNIT} "${toUnit}". ${commonMessages.SUPPORTED_TIME_UNITS}`
    );
  }

  // Convert from `fromUnit` to milliseconds
  const durationInMilliseconds = duration * unitsInMilliseconds[fromUnitLower];

  // Convert from milliseconds to `toUnit`

  return durationInMilliseconds / unitsInMilliseconds[toUnitLower];
};

/**
 * Calculates pagination parameters.
 *
 * @param _page - The current page number.
 * @param _limit - The number of items per page.
 * @returns An object containing the limit and offset for pagination.
 *          - limit: The adjusted number of items per page.
 *          - offset: The offset from the start of the dataset for the current page.
 */

export const getPagination = (_page: number, _limit: number) => {
  const limit = _limit ? +_limit : commonVariables.paginations.ITEM_LIMIT;
  const offset = _page
    ? (_page - 1) * limit
    : commonVariables.paginations.DEFAULT_PAGE;

  return { limit, offset };
};

/**
 * Creates a rate limiter middleware
 * @param {number} maxRequests - Maximum number of requests allowed in the time window
 * @param {number} windowMs - Time window in milliseconds
 * @param {string} errorMessage - Message to send when rate limit is exceeded
 * @returns {rateLimit} - Express middleware for rate limiting
 */
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: {
      status: TOO_MANY_REQUESTS,
      success: false,
      message: commonMessages.TOO_MANY_RESET_ATTEMPTS,
      data: null,
    },
    standardHeaders: true, // Send rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req: any) => req.body.email || req.query.email,
  });
};

const SECRET_KEY = crypto
  .createHash("sha256")
  .update("my-secret-passphrase")
  .digest(); // 32 bytes

// Encrypt
export function encrypt(text: string) {
  const iv = crypto.randomBytes(16); // generate a new IV
  const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Prepend IV to encrypted text
  return `${iv.toString("hex")}:${encrypted}`;
}

// Decrypt
export function decrypt(encryptedText: string) {
  try {
    const [ivHex, encrypted] = encryptedText.split(":");
    const iv = Buffer.from(ivHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-cbc", SECRET_KEY, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    throw new Error("Decryption failed");
  }
}
/**
 * Function to upper case the enum values
 * @param value
 * @returns
 */
export function toUpperAndValidateEnums(value: string) {
  const upper = value.toUpperCase();
  // removing this check as some enums are dynamic
  if (!(ALL_ENUMS as string[]).includes(upper)) {
    throw new Error(
      `Invalid value: ${value}. Allowed values are: ${ALL_ENUMS.join(", ")}`
    );
  }
  return upper;
}

export const capitalize = (str?: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

export const formatRoleForMessage = (role: string): string => {
  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const checkUserProfileExists = async (
  tx: Prisma.TransactionClient,
  role: string,
  user_id: number
): Promise<boolean> => {
  if (role === UserRole.INVESTOR) {
    return !!(await tx.investorProfile.findFirst({
      where: { user_id },
    }));
  }

  if (role === UserRole.AGENT) {
    return !!(await tx.agentProfile.findFirst({
      where: { user_id },
    }));
  }

  return false;
};
