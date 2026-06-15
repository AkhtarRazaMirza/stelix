export class CalendarService {
  public async getEvents() {
    return [
      {
        id: "1",
        title: "Team Meeting",
        start: new Date(),
        end: new Date(),
      },
      {
        id: "2",
        title: "Project Review",
        start: new Date(),
        end: new Date(),
      },
    ];
  }

  public async createEvent(data: {
    title: string;
    start: string;
    end: string;
  }) {
    return {
      id: crypto.randomUUID(),
      ...data,
    };
  }
}