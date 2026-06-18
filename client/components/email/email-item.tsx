import { Email } from "@/types/email";

interface EmailItemProps {
  email: Email;
}

function getSenderName(
  from: string
) {
  const match =
    from.match(/^(.*?)</);

  return match
    ? match[1].trim()
    : from;
}

export function EmailItem({
  email,
}: EmailItemProps) {
  return (
    <div className="cursor-pointer rounded-xl border border-white/10 bg-[#111111] p-5 transition-all hover:border-white/20 hover:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-300">
            {getSenderName(
              email.from
            )}
          </p>

          <h3 className="mt-1 font-semibold text-white">
            {email.subject}
          </h3>
        </div>

        <p className="whitespace-nowrap text-xs text-zinc-500">
          {new Date(
            email.receivedAt
          ).toLocaleDateString()}
        </p>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-zinc-400">
        {email.snippet}
      </p>
    </div>
  );
}