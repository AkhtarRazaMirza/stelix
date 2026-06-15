import { CalendarEvent } from "@/types/calendar";
import { EventItem } from "./event-item";

interface EventListProps {
  events: CalendarEvent[];
}

export function EventList({
  events,
}: EventListProps) {
  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div
          key={event.id}
          className="rounded-xl border border-white/10 p-4"
        >
          <h3 className="font-medium">
            {event.title}
          </h3>

          <p className="text-sm text-zinc-400">
            {new Date(event.start).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}