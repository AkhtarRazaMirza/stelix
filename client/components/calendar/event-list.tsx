import { CalendarEvent } from "@/types/calendar";
import { EventItem } from "./event-item";

interface EventListProps {
  events: CalendarEvent[];
}

export function EventList({
  events,
}: EventListProps) {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventItem
          key={event.id}
          event={event}
        />
      ))}
    </div>
  );
}