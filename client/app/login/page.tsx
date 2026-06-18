"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginSchema,
  type LoginInput,
} from "@/lib/validations/auth";

import { login, loginWithGoogle, ApiError } from "@/lib/api/auth";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const router = useRouter();

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginInput>({
    resolver:
      zodResolver(loginSchema),
  });

  async function onSubmit(
    data: LoginInput
  ) {
    try {
      setServerError("");
      await login(data);

      router.push("/command-center");
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Login failed"
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
          Welcome Back
        </h1>

        <p className="mb-8 text-zinc-400">
          Sign in to continue using Stelix.
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
              {...register("email")}
              type="email"
              placeholder="Email"
              className="w-full rounded-lg border border-white/10 bg-black px-4 py-3"
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <input
              {...register(
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
              ? "Signing In..."
              : "Sign In"}
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