import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-5xl font-bold">
          Ready to Take Control?
        </h2>

        <p className="mt-6 text-zinc-400">
          Bring your inbox, calendar, and AI assistant together.
        </p>

        <Link
          href="/signup"
          className="mt-10 inline-block rounded-lg bg-white px-8 py-4 text-black font-medium"
        >
          Launch Stelix
        </Link>
      </div>
    </section>
  );
}