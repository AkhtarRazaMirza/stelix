"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { loginWithGoogle, ApiError } from "@/lib/api/auth";
import { GoogleLogin } from "@react-oauth/google";

export default function SignupPage() {
  const router = useRouter();

  const [serverError, setServerError] = useState("");

  async function handleGoogleLogin(
    credentialResponse: { credential?: string }
  ) {
    try {
      setServerError("");

      if (!credentialResponse.credential) {
        throw new Error("Google credential missing");
      }

      await loginWithGoogle(
        credentialResponse.credential
      );

      router.push("/command-center");
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Google login failed"
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] p-8">
        <h1 className="mb-2 text-3xl font-bold">
          Create Account
        </h1>

        <p className="mb-8 text-zinc-400">
          Start using Stelix today.
        </p>

        {serverError && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {serverError}
          </div>
        )}

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              setServerError("Google login failed");
            }}
          />
        </div>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-white"
          >
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}