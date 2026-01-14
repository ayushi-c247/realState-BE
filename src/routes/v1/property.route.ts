import express, { Router } from "express";
import { UserRole } from "@prisma/client";

import {
  authenticate,
  authorize,
  validate,
  validateParams,
} from "@middlewares";

import { propertyController } from "@controllers";
import { commonValidations, propertyValidations } from "@validations";

const router: Router = express.Router();
router.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.ADMIN, UserRole.AGENT),
  propertyController.getProperties
);
router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validateParams(commonValidations.idSchema),
  propertyController.deletePropertyById
);

router.patch(
  "/status/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(propertyValidations.updatePropertyVisiblityStatusSchema),
  validateParams(commonValidations.idSchema),
  propertyController.updatePropertyStatusById
);

router.get(
  "/:id",
  authenticate,
  validateParams(commonValidations.idSchema),
  propertyController.getPropertyById
);

export default router;
