import {
  Bot,
  Inbox,
  Calendar,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Assistant",
    description:
      "Manage emails and calendar using natural language.",
  },
  {
    icon: Inbox,
    title: "Smart Inbox",
    description:
      "Read, organize, and summarize Gmail messages.",
  },
  {
    icon: Calendar,
    title: "Calendar Intelligence",
    description:
      "Track meetings and upcoming events in one place.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold">
            Everything in One Place
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-[#111111] p-8"
              >
                <Icon className="mb-4 h-8 w-8" />

                <h3 className="mb-2 text-xl font-semibold">
                  {feature.title}
                </h3>

                <p className="text-zinc-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}