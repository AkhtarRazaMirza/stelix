import { Card } from "./card";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
}

export function StatCard({
  title,
  value,
  description,
}: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="space-y-2">
        <p className="text-sm text-zinc-400">
          {title}
        </p>

        <h3 className="text-4xl font-bold">
          {value}
        </h3>

        {description && (
          <p className="text-xs text-zinc-500">
            {description}
          </p>
        )}
      </div>
    </Card>
  );
}