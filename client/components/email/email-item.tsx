import { Email } from "@/types/email";

interface EmailItemProps {
  email: Email;
}

export function EmailItem({
  email,
}: EmailItemProps) {
  return (
    <div className="cursor-pointer rounded-xl border border-white/10 bg-[#111111] p-4 transition hover:border-white/20 hover:bg-white/5">
      <div className="flex items-center justify-between">
        <p className="font-medium">
          {email.from}
        </p>

        <p className="text-xs text-zinc-500">
          {new Date(
            email.receivedAt
          ).toLocaleDateString()}
        </p>
      </div>

      <p className="mt-2 font-semibold">
        {email.subject}
      </p>

      <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
        {email.snippet}
      </p>
    </div>
  );
}