import { CalendarEvent } from "@/types/calendar";

interface EventItemProps {
  event: CalendarEvent;
}

export function EventItem({
  event,
}: EventItemProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111111] p-5 transition-all hover:border-white/20 hover:bg-white/[0.03]">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-white">
            {event.title}
          </h3>

          <p className="mt-2 text-sm text-zinc-400">
            {new Date(
              event.start
            ).toLocaleString()}
          </p>

          <p className="text-sm text-zinc-500">
            Ends:{" "}
            {new Date(
              event.end
            ).toLocaleString()}
          </p>
        </div>

        <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-1 text-xs text-green-400">
          {event.status}
        </span>
      </div>

      {event.htmlLink && (
        <a
          href={event.htmlLink}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-sm text-blue-400 hover:underline"
        >
          Open in Google Calendar →
        </a>
      )}
    </div>
  );
}