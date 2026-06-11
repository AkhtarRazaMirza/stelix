export function AppHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 px-6">
      <div>
        <h2 className="text-lg font-semibold">
          Command Center
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-zinc-700" />
      </div>
    </header>
  );
}