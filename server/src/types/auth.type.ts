import { z } from "zod";

export const createUserWithEmailPasswordInput = z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    profileImage: z.string().optional(),
});

export type CreateUserWithEmailPasswordInput = z.infer<typeof createUserWithEmailPasswordInput>;

export const loginUserWithEmailPasswordInput = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export type LoginUserWithEmailPasswordInput = z.infer<typeof loginUserWithEmailPasswordInput>;

export const resetPasswordInput = z.object({
    token: z.string(),
    newPassword: z.string().min(8),
});

export type ResetPasswordInput =
    z.infer<typeof resetPasswordInput>;



export const forgotPasswordInput = z.object({
    email: z.string().email(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordInput>;


export const loginUserWithGoogleInput =
  z.object({
    idToken: z.string(),
  });

export type LoginUserWithGoogleInput =
  z.infer<
    typeof loginUserWithGoogleInput
  >;


export const verifyEmailInput = z.object({
    token: z.string(),
});

export type VerifyEmailInput =
    z.infer<typeof verifyEmailInput>;

export const updateUserProfileInput = z.object({
    fullName: z.string().min(1).optional(),
    profileImage: z.string().optional(),
});

export type UpdateUserProfileInput =
    z.infer<typeof updateUserProfileInput>;
