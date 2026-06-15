interface EmailItemProps {
  from: string;
  subject: string;
  snippet: string;
}

export function EmailItem({
  from,
  subject,
  snippet,
}: EmailItemProps) {
  return (
    <div className="rounded-xl border border-white/10 p-4">
      <p className="font-medium">
        {from}
      </p>

      <p className="mt-1">
        {subject}
      </p>

      <p className="mt-2 text-sm text-zinc-400">
        {snippet}
      </p>
    </div>
  );
}