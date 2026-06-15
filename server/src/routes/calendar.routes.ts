import { Router } from "express";
import { CalendarController } from "../controllers/calendar.controller.js";
import { verifyAccessToken } from "../middleware/auth.middleware.js";

const router = Router();
const calendarController =
  new CalendarController();

router.get(
  "/",
  verifyAccessToken,
  (req, res) =>
    calendarController.getEvents(
      req,
      res
    )
);

// router.post(
//   "/",
//   verifyAccessToken,
//   (req, res) =>
//     calendarController.createEvent(
//       req,
//       res
//     )
// );

export const calendarRoutes = router;