const steps = [
  "Connect Gmail",
  "Connect Google Calendar",
  "Ask Stelix",
  "Get Work Done",
];

export function HowItWorksSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-16 text-center text-4xl font-bold">
          How It Works
        </h2>

        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step}
              className="rounded-2xl border border-white/10 bg-[#111111] p-6 text-center"
            >
              <div className="mb-4 text-3xl font-bold text-zinc-500">
                {index + 1}
              </div>

              <p>{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}