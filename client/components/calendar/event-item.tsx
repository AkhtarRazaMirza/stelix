import { CalendarEvent } from "@/types/calendar";

interface EventItemProps {
  event: CalendarEvent;
}

export function EventItem({
  event,
}: EventItemProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111111] p-4">
      <h3 className="font-semibold">
        {event.title}
      </h3>

      <p className="mt-2 text-sm text-zinc-400">
        {new Date(event.start).toLocaleString()}
      </p>

      <p className="text-sm text-zinc-500">
        {new Date(event.end).toLocaleString()}
      </p>
    </div>
  );
}