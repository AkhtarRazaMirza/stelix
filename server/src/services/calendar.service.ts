import { corsair } from "../corsair.js";

export class CalendarService {
  async getEvents() {
    const result =
      await corsair.googlecalendar.api.events.getMany({});

    return result.items.map((event: any) => ({
      id: event.id,
      title: event.summary,
      start: event.start?.dateTime,
      end: event.end?.dateTime,
      status: event.status,
      htmlLink: event.htmlLink,
    }));
  }
}