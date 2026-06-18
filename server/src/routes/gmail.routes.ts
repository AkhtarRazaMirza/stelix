import { Router } from "express";
import { GmailController } from "../controllers/gmail.controller.js";
import {
  requireUserId,
  verifyAccessToken,
} from "../middleware/auth.middleware.js";
import { asyncHandler, validate } from "../middleware/validate.middleware.js";
import {
  emailIdParamSchema,
  gmailSearchQuerySchema,
  inboxQuerySchema,
  sendEmailSchema,
} from "../validations/gmail.validation.js";

const router = Router();
const controller = new GmailController();

router.get(
  "/inbox",
  verifyAccessToken,
  requireUserId,
  validate({ query: inboxQuerySchema }),
  asyncHandler((req, res) => controller.getInbox(req, res))
);

router.get(
  "/sent",
  verifyAccessToken,
  requireUserId,
  validate({ query: inboxQuerySchema }),
  asyncHandler((req, res) => controller.getSentEmails(req, res))
);

router.get(
  "/search",
  verifyAccessToken,
  requireUserId,
  validate({ query: gmailSearchQuerySchema }),
  asyncHandler((req, res) => controller.searchEmails(req, res))
);

router.post(
  "/send",
  verifyAccessToken,
  requireUserId,
  validate({ body: sendEmailSchema }),
  asyncHandler((req, res) => controller.sendEmail(req, res))
);

router.post(
  "/refresh",
  verifyAccessToken,
  requireUserId,
  asyncHandler((req, res) => controller.refreshInbox(req, res))
);

router.get(
  "/emails/:emailId",
  verifyAccessToken,
  requireUserId,
  validate({ params: emailIdParamSchema }),
  asyncHandler((req, res) => controller.getEmail(req, res))
);

export const gmailRoutes = router;
