import { Router } from "express";
import { CalendarController } from "../controllers/calendar.controller.js";
import {
  requireUserId,
  verifyAccessToken,
} from "../middleware/auth.middleware.js";
import { asyncHandler, validate } from "../middleware/validate.middleware.js";
import {
  createEventSchema,
  updateEventSchema,
  inviteEventSchema,
  rescheduleEventSchema,
  eventIdParamSchema,
  eventSearchQuerySchema,
  eventListQuerySchema,
} from "../validations/calendar.validation.js";

const router = Router();
const controller = new CalendarController();

router.get(
  "/",
  verifyAccessToken,
  requireUserId,
  asyncHandler((req, res) => controller.getEvents(req, res))
);

router.get(
  "/upcoming",
  verifyAccessToken,
  requireUserId,
  asyncHandler((req, res) => controller.getUpcomingEvents(req, res))
);

router.get(
  "/search",
  verifyAccessToken,
  requireUserId,
  validate({ query: eventSearchQuerySchema }),
  asyncHandler((req, res) => controller.searchEvents(req, res))
);

router.get(
  "/events",
  verifyAccessToken,
  requireUserId,
  validate({ query: eventListQuerySchema }),
  asyncHandler((req, res) => controller.listEvents(req, res))
);

router.post(
  "/events",
  verifyAccessToken,
  requireUserId,
  validate({ body: createEventSchema }),
  asyncHandler((req, res) => controller.createEvent(req, res))
);

router.post(
  "/invite",
  verifyAccessToken,
  requireUserId,
  validate({ body: inviteEventSchema }),
  asyncHandler((req, res) => controller.inviteAttendees(req, res))
);

router.post(
  "/reschedule",
  verifyAccessToken,
  requireUserId,
  validate({ body: rescheduleEventSchema }),
  asyncHandler((req, res) => controller.rescheduleEvent(req, res))
);

router.get(
  "/events/:eventId",
  verifyAccessToken,
  requireUserId,
  validate({ params: eventIdParamSchema }),
  asyncHandler((req, res) => controller.getEvent(req, res))
);

router.patch(
  "/events/:eventId",
  verifyAccessToken,
  requireUserId,
  validate({ params: eventIdParamSchema, body: updateEventSchema }),
  asyncHandler((req, res) => controller.updateEvent(req, res))
);

router.delete(
  "/events/:eventId",
  verifyAccessToken,
  requireUserId,
  validate({ params: eventIdParamSchema }),
  asyncHandler((req, res) => controller.deleteEvent(req, res))
);

export const calendarRoutes = router;
