interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({
  title,
  description,
}: PageHeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-bold">
        {title}
      </h1>

      {description && (
        <p className="text-zinc-400">
          {description}
        </p>
      )}
    </div>
  );
}
