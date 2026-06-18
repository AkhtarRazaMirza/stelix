import { Router } from "express";
import { EmailController } from "../controllers/email.controller.js";
import {
  requireUserId,
  verifyAccessToken,
} from "../middleware/auth.middleware.js";
import { asyncHandler, validate } from "../middleware/validate.middleware.js";
import {
  emailIdParamSchema,
  emailSearchQuerySchema,
} from "../validations/email.validation.js";

const router = Router();
const controller = new EmailController();

router.get(
  "/",
  verifyAccessToken,
  requireUserId,
  asyncHandler((req, res) => controller.getEmails(req, res))
);

router.get(
  "/search",
  verifyAccessToken,
  requireUserId,
  validate({ query: emailSearchQuerySchema }),
  asyncHandler((req, res) => controller.searchEmails(req, res))
);

router.get(
  "/:id",
  verifyAccessToken,
  requireUserId,
  validate({ params: emailIdParamSchema }),
  asyncHandler((req, res) => controller.getEmailById(req, res))
);

export const emailRoutes = router;
