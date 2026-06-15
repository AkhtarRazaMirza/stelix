"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    console.log({
      email,
      password,
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] p-8">
        <h1 className="mb-2 text-3xl font-bold">
          Welcome Back
        </h1>

        <p className="mb-8 text-zinc-400">
          Sign in to continue using Stelix.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full rounded-lg border border-white/10 bg-black px-4 py-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="w-full rounded-lg border border-white/10 bg-black px-4 py-3"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-white py-3 font-medium text-black"
          >
            Sign In
          </button>
        </form>

        <button
          className="mt-4 w-full rounded-lg border border-white/10 py-3"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-white"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}