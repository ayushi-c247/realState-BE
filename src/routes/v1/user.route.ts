import express, { Router } from "express";
import { UserRole } from "@prisma/client";

import {
  authenticate,
  authorize,
  validate,
  validateParams,
} from "@middlewares";

import { userController } from "@controllers";
import { commonValidations, userValidation } from "@validations";

const router: Router = express.Router();

router.post(
  "/add",
  validate(userValidation.addUserValidation),
  userController.createUser
);
router.post(
  "/investor-profile",
  authenticate,
  authorize(UserRole.INVESTOR, UserRole.AGENT),
  validate(userValidation.createInvestorProfileValidation),
  userController.createInvestorProfile
);
router.post(
  "/agent-profile",
  authenticate,
  authorize(UserRole.AGENT, UserRole.AGENT),
  validate(userValidation.createAgentProfileValidation),
  userController.createAgentProfile
);

router.put(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INVESTOR, UserRole.AGENT),
  validate(userValidation.updateUserSchema),
  validateParams(commonValidations.idSchema),
  userController.updateUserById
);

router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validateParams(commonValidations.idSchema),
  userController.deleteUserById
);

router.patch(
  "/status/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(userValidation.updateStatusSchema),
  validateParams(commonValidations.idSchema),
  userController.updateUserStatusById
);

router.patch(
  "/agent-status/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(userValidation.updateAgentStatusSchema),
  validateParams(commonValidations.idSchema),
  userController.approveAgentStatusById
);

router.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  userController.getUsers
);

router.get(
  "/:id",
  authenticate,
  validateParams(commonValidations.idSchema),
  userController.getUserById
);

router.post(
  "/resend-invitation",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(userValidation.resendInvitationSchema),
  userController.resendVerificationInvitation
);
export default router;
