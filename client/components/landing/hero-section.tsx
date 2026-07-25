import Link from "next/link";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 py-32 text-center">
                <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-400">
                    AI Productivity Platform
                </div>

                <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
                    Your AI
                    <br />
                    Command Center
                </h1>

                <p className="mx-auto mt-8 max-w-2xl text-lg text-zinc-400">
                    Connect Gmail and Google Calendar.
                    Manage your workflow through one intelligent assistant.
                </p>

                <div className="mt-10 flex justify-center gap-4">
                    <Link
                        href="/signup"
                        className="rounded-lg bg-white px-6 py-3 font-medium text-black"
                    >
                        Get Started
                    </Link>

                    <Link
                        href="/login"
                        className="rounded-lg border border-white/10 px-6 py-3"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </section>
    );
}