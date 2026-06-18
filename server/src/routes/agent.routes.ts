import { Router } from "express";
import { AgentController } from "../controllers/agent.controller.js";
import {
  requireUserId,
  verifyAccessToken,
} from "../middleware/auth.middleware.js";
import { asyncHandler, validate } from "../middleware/validate.middleware.js";
import { agentChatSchema } from "../validations/agent.validation.js";

const router = Router();
const controller = new AgentController();

router.post(
  "/chat",
  verifyAccessToken,
  requireUserId,
  validate({ body: agentChatSchema }),
  asyncHandler((req, res) => controller.chat(req, res))
);

export const agentRoutes = router;
