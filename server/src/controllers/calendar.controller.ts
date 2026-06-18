import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { CalendarService } from "../services/calendar.service.js";
import { logger } from "../config/logger.js";
import type {
  CreateEventInput,
  RescheduleEventInput,
  UpdateEventFields,
} from "../types/calendar.types.js";

const calendarService = new CalendarService();

export class CalendarController {
  public async getEvents(req: AuthRequest, res: Response) {
    logger.info("GET /api/calendar", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
      provider: "googlecalendar",
    });

    const events = await calendarService.getEvents(req.userId!);

    res.status(200).json({ events });
  }

  public async getUpcomingEvents(req: AuthRequest, res: Response) {
    logger.info("GET /api/calendar/upcoming", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
      provider: "googlecalendar",
    });

    const events = await calendarService.getUpcomingEvents(req.userId!);

    res.status(200).json({ events });
  }

  public async listEvents(req: AuthRequest, res: Response) {
    const pageToken = req.query.pageToken as string | undefined;

    logger.info("GET /api/calendar/events", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
    });

    const data = await calendarService.listEvents(req.userId!, pageToken);

    res.status(200).json(data);
  }

  public async searchEvents(req: AuthRequest, res: Response) {
    const query = req.query.q as string;

    logger.info("GET /api/calendar/search", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
    });

    const data = await calendarService.searchEvents(req.userId!, query);

    res.status(200).json(data);
  }

  public async getEvent(req: AuthRequest, res: Response) {
    const eventId = req.params.eventId as string;

    logger.info("GET /api/calendar/events/:eventId", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
      eventId,
    });

    const event = await calendarService.getEvent(req.userId!, eventId);

    res.status(200).json({ event });
  }

  public async createEvent(req: AuthRequest, res: Response) {
    const input = req.body as CreateEventInput;

    logger.info("POST /api/calendar/events", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
    });

    const event = await calendarService.createEvent(req.userId!, input);

    res.status(201).json({ event });
  }

  public async updateEvent(req: AuthRequest, res: Response) {
    const eventId = req.params.eventId as string;
    const fields = req.body as UpdateEventFields;

    logger.info("PATCH /api/calendar/events/:eventId", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
      eventId,
    });

    const event = await calendarService.updateEvent(
      req.userId!,
      eventId,
      fields
    );

    res.status(200).json({ event });
  }

  public async deleteEvent(req: AuthRequest, res: Response) {
    const eventId = req.params.eventId as string;

    logger.info("DELETE /api/calendar/events/:eventId", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
      eventId,
    });

    await calendarService.deleteEvent(req.userId!, eventId);

    res.status(200).json({ success: true });
  }

  public async inviteAttendees(req: AuthRequest, res: Response) {
    const input = req.body as CreateEventInput;

    logger.info("POST /api/calendar/invite", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
    });

    const event = await calendarService.createEvent(req.userId!, input, true);

    res.status(201).json({ event });
  }

  public async rescheduleEvent(req: AuthRequest, res: Response) {
    const input = req.body as RescheduleEventInput;

    logger.info("POST /api/calendar/reschedule", {
      userId: req.userId,
      requestId: req.requestId,
      route: req.path,
      eventId: input.eventId,
    });

    const event = await calendarService.rescheduleEvent(req.userId!, input);

    res.status(200).json({ event });
  }
}
