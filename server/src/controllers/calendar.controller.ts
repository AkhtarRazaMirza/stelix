import type { Request, Response } from "express";
import { CalendarService } from "../services/calendar.service.js";

const calendarService = new CalendarService();

export class CalendarController {
  public async getEvents(
    req: Request,
    res: Response
  ) {
    try {
      const events =
        await calendarService.getEvents();

      res.status(200).json({
        events,
      });
    } catch (error) {
      res.status(500).json({
        error: (error as Error).message,
      });
    }
  }

  // public async createEvent(
  //   req: Request,
  //   res: Response
  // ) {
  //   try {
  //     const event =
  //       await calendarService.createEvent(
  //         req.body
  //       );

  //     res.status(201).json({
  //       event,
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       error: (error as Error).message,
  //     });
  //   }
  // }
}