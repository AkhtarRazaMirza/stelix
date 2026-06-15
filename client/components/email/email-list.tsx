import { Email } from "@/types/email";
import { EmailItem } from "./email-item";

interface EmailListProps {
  emails: Email[];
}

export function EmailList({
  emails,
}: EmailListProps) {
  return (
    <div className="space-y-3">
      {emails.map((email) => (
        <EmailItem
          key={email.id}
          email={email}
        />
      ))}
    </div>
  );
}