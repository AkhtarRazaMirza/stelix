"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/auth";

import { register as registerUser, loginWithGoogle, ApiError } from "@/lib/api/auth";
import { GoogleLogin } from "@react-oauth/google";

export default function SignupPage() {
  const router = useRouter();

  const [serverError, setServerError] = useState("");

  const {
    register: registerField,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterInput>({
    resolver:
      zodResolver(registerSchema),
  });

  async function onSubmit(
    data: RegisterInput
  ) {
    try {
      setServerError("");
      await registerUser(data);

      router.push(
        "/login?registered=true"
      );
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Registration failed"
      );
    }
  }

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

        <form
          onSubmit={handleSubmit(
            onSubmit
          )}
          className="space-y-4"
        >
          <div>
            <input
              {...registerField(
                "fullName"
              )}
              placeholder="Full Name"
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3"
            />

            {errors.fullName && (
              <p className="mt-1 text-sm text-red-500">
                {
                  errors.fullName
                    .message
                }
              </p>
            )}
          </div>

          <div>
            <input
              {...registerField(
                "email"
              )}
              type="email"
              placeholder="Email"
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3"
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {
                  errors.email
                    .message
                }
              </p>
            )}
          </div>

          <div>
            <input
              {...registerField(
                "password"
              )}
              type="password"
              placeholder="Password"
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3"
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {
                  errors.password
                    .message
                }
              </p>
            )}
          </div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full rounded-lg bg-white py-3 font-medium text-black disabled:opacity-50"
          >
            {isSubmitting
              ? "Creating..."
              : "Create Account"}
          </button>
        </form>
        <div className="mt-4 flex justify-center">
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