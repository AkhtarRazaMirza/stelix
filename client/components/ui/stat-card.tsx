import { Card } from "./card";

interface StatCardProps {
  title: string;
  value: string | number;
}

export function StatCard({
  title,
  value,
}: StatCardProps) {
  return (
    <Card>
      <p className="text-sm text-zinc-400">
        {title}
      </p>

      <h3 className="mt-2 text-3xl font-bold">
        {value}
      </h3>
    </Card>
  );
}