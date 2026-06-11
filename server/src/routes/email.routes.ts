import { Router } from "express";
import { EmailController } from "../controllers/email.controller.js";
import { verifyAccessToken } from "../middleware/auth.middleware.js";

const router = Router();
const controller = new EmailController();

router.get(
  "/",
  verifyAccessToken,
  (req, res) => controller.getEmails(req, res)
);

router.get(
  "/:id",
  verifyAccessToken,
  (req, res) => controller.getEmail(req, res)
);

router.post(
  "/send",
  verifyAccessToken,
  (req, res) => controller.sendEmail(req, res)
);

export const emailRoutes = router;