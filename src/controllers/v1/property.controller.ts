import type { NextFunction, Request, Response } from "express";
import { VisibilityStatus } from "@prisma/client";
import { propertyService } from "@services";

import { ErrorHandler, catchHandler } from "@utils";
import { responseHandler } from "@middlewares";
import { IAuthRequest } from "@customTypes";
import { BAD_REQUEST } from "@constants";

/**
 * Controller to get the all properties
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
export const getProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, search, sortBy, sortOrder, filter } = req.query;
    const filters = filter ? JSON.parse(filter as string) : {};
    const { status, success, message, data } =
      await propertyService.getProperties(
        Number(page),
        Number(limit),
        search as string,
        sortOrder as string,
        sortBy as string,
        filters
      );
    if (success) {
      responseHandler(res, message, status, data);
    } else {
      next(new ErrorHandler(message, status, data));
    }
  } catch (error) {
    catchHandler(error, next);
  }
};
/**
 * Controller to get a single property by id
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
export const getPropertyById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = Number(id);
    if (isNaN(userId) || userId <= 0) {
      return next(new ErrorHandler("Invalid id", BAD_REQUEST));
    }
    const { status, success, message, data } =
      await propertyService.getPropertyById(userId);
    if (success) {
      responseHandler(res, message, status, data);
    } else {
      next(new ErrorHandler(message, status, data));
    }
  } catch (error) {
    catchHandler(error, next);
  }
};

/**
 * Controller to delete a property by id
 * @param req
 * @param res
 * @param next
 */
export const deletePropertyById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = (req as IAuthRequest).params;

    const { status, success, message, data } =
      await propertyService.deletePropertyById(Number(id));
    if (success) {
      responseHandler(res, message, status, data);
    } else {
      next(new ErrorHandler(message, status, data));
    }
  } catch (error) {
    catchHandler(error, next);
  }
};

/**
 * Update agent status controller
 * @param req  {userId, status}
 * @param res
 * @param next
 */
export const updatePropertyStatusById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status: propertyStatus } = (req as IAuthRequest).body;
    const { status, success, message, data } =
      await propertyService.updatePropertyStatusById(
        Number(id),
        propertyStatus as VisibilityStatus
      );
    if (success) {
      responseHandler(res, message, status, data);
    } else {
      next(new ErrorHandler(message, status, data));
    }
  } catch (error) {
    catchHandler(error, next);
  }
};
