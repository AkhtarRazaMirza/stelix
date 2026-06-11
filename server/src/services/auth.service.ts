import {
    createUserWithEmailPasswordInput,
    type CreateUserWithEmailPasswordInput,
    loginUserWithEmailPasswordInput,
    type LoginUserWithEmailPasswordInput,
    updateUserProfileInput,
    type UpdateUserProfileInput,
    forgotPasswordInput,
    type ForgotPasswordInput,
    resetPasswordInput,
    type ResetPasswordInput,
    loginUserWithGoogleInput,
    type LoginUserWithGoogleInput
} from "../type/auth.type.js";

import { db } from "../config/db.js";
import { usersTable } from "../db/schema.js";

import { eq } from "drizzle-orm";

import { TokenService } from "../config/jwt.js";
import type { Response } from "express";
import { EmailService } from "../config/email.js";
import { deleteAvatar, uploadAvatar } from "../config/avatar.js"
import { googleOAuth2Client } from "../config/google.auth.js"
import { env } from "../env.js";
import bcrypt from "bcrypt";

export class AuthService {
    private readonly ACCESS_TOKEN_COOKIE_NAME = "accessToken";

    private getCookieOptions(expiresIn: number) {
        return {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            maxAge: expiresIn * 1000,
        };
    }

    private emailService = new EmailService();

    private tokenService = new TokenService();

    private async findByEmail(email: string) {
        const user = await db.select().from(usersTable).where(eq(usersTable.email, email))
        return user[0] ?? null;
    }

    private async findById(id: string) {
        const user = await db.select().from(usersTable).where(eq(usersTable.id, id))
        return user[0] ?? null;
    }

    private async hashPassword(password: string) {
        return bcrypt.hash(password, 12);
    }

    private async verifyPassword(
        password: string,
        hash: string
    ) {
        return bcrypt.compare(password, hash);
    }

    private async uploadProfileImage(profileImage?: string) {
        if (!profileImage) {
            return {
                profileImageUrl: undefined,
                profileImagePublicId: undefined,
            };
        }

        const {
            url,
            publicId,
        } = await uploadAvatar(profileImage);

        return {
            profileImageUrl: url,
            profileImagePublicId: publicId,
        };
    }

    public setAuthCookies(
        res: Response,
        accessToken: string,
    ) {
        // 7 days
        res.cookie(
            this.ACCESS_TOKEN_COOKIE_NAME,
            accessToken,
            this.getCookieOptions(60 * 60 * 24 * 7)
        );
    }

    public clearAuthCookies(res: Response) {
        res.clearCookie(this.ACCESS_TOKEN_COOKIE_NAME);
    }

    public async createUserWithEmailPassword(input: CreateUserWithEmailPasswordInput) {
        const {
            fullName,
            email,
            password,
            profileImage,
        } = await createUserWithEmailPasswordInput.parseAsync(input);

        const existingUser =
            await this.findByEmail(email);

        if (existingUser) {
            throw new Error("User already exists");
        }

        const {
            profileImageUrl,
            profileImagePublicId,
        } = await this.uploadProfileImage(
            profileImage
        );

        const passwordHash = await this.hashPassword(password);

        const insertedUsers = await db.insert(usersTable).values({
            fullName,
            email,
            profileImageUrl,
            profileImagePublicId,
            passwordHash,
        }).returning({
            id: usersTable.id,
            fullName: usersTable.fullName,
            email: usersTable.email,
            profileImageUrl: usersTable.profileImageUrl,
            emailVerified: usersTable.emailVerified,
        });

        const user = insertedUsers[0];

        if (!user) {
            throw new Error("Failed to create user");
        }

        const verificationToken =
            this.tokenService.generateEmailVerificationToken(
                user.id
            );

        await this.emailService.sendVerificationEmail(
            user.email,
            user.fullName,
            verificationToken
        );

        return {
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                profileImageUrl: user.profileImageUrl,
                emailVerified: user.emailVerified,
            },
        };
    }

    public async verifyEmail(token: string) {
        const payload =
            this.tokenService.verifyEmailVerificationToken(
                token
            );

        const user = await this.findById(
            payload.userId
        );

        if (!user) {
            throw new Error(
                "User not found"
            );
        }

        if (user.emailVerified) {
            return {
                success: true,
                message:
                    "Email already verified",
            };
        }

        await db.update(usersTable).set({
            emailVerified: true
        }).where(eq(usersTable.id, user.id))

        await this.emailService.sendWelcomeEmail(
            user.email,
            user.fullName
        );

        return {
            success: true,
            message:
                "Email verified successfully",
        };
    }

    public async loginUserWithEmailPassword(input: LoginUserWithEmailPasswordInput) {
        const validatedInput =
            await loginUserWithEmailPasswordInput.parseAsync(
                input
            );

        const user = await this.findByEmail(
            validatedInput.email
        );

        if (!user) {
            throw new Error(
                "Invalid email or password"
            );
        }

        if (
            !user.passwordHash
        ) {
            throw new Error(
                "This account uses Google sign in."
            );
        }


        const isValidPassword =
            await this.verifyPassword(
                validatedInput.password,
                user.passwordHash
            );

        if (!isValidPassword) {
            throw new Error(
                "Invalid email or password"
            );
        }

        if (!user.emailVerified) {
            throw new Error(
                "Please verify your email first."
            );
        }

        await db.update(usersTable).set({
            lastLoginAt: new Date(),
        }).where(eq(usersTable.id, user.id))

        const accessToken =
            this.tokenService.generateAccessToken(
                user.id
            );

        return {
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                profileImageUrl:
                    user.profileImageUrl,
                emailVerified:
                    user.emailVerified,
            },
            accessToken,
        };
    }

    public async getUserById(userId: string) {
        try {
            const users = await db
                .select({
                    id: usersTable.id,
                    fullName: usersTable.fullName,
                    email: usersTable.email,
                    lastLogin: usersTable.lastLoginAt,
                    createdAt: usersTable.createdAt,
                })
                .from(usersTable)
                .where(eq(usersTable.id, userId));

            return users.length > 0 ? users[0] : null;
        } catch (error) {
            console.error("GET USER ERROR:", error);
            throw error;
        }
    }

    public async updateUserProfile(userId: string, input: UpdateUserProfileInput) {
        const validatedInput =
            await updateUserProfileInput.parseAsync(
                input
            );

        const existingUser =
            await this.findById(
                userId
            );

        if (!existingUser) {
            throw new Error(
                "User not found"
            );
        }

        let profileImageUrl =
            existingUser.profileImageUrl ?? undefined;

        let profileImagePublicId =
            existingUser.profileImagePublicId ?? undefined;

        if (validatedInput.profileImage) {
            if (
                existingUser.profileImagePublicId
            ) {
                await deleteAvatar(
                    existingUser.profileImagePublicId
                );
            }

            const uploadedImage =
                await uploadAvatar(
                    validatedInput.profileImage
                );

            profileImageUrl =
                uploadedImage.url;

            profileImagePublicId =
                uploadedImage.publicId;

        }

        const [updatedUser] =
            await db
                .update(usersTable)
                .set({
                    fullName: validatedInput.fullName,
                    profileImagePublicId: profileImagePublicId,
                    profileImageUrl: profileImageUrl
                })
                .where(eq(usersTable.id, userId))
                .returning({
                    id: usersTable.id,
                    fullName: usersTable.fullName,
                    profileImageUrl: usersTable.profileImageUrl,
                });

        return { user: updatedUser };
    }

    public async forgotPassword(input: ForgotPasswordInput) {
        const validatedInput =
            await forgotPasswordInput.parseAsync(
                input
            );

        const user =
            await this.findByEmail(
                validatedInput.email
            );

        if (!user) {
            return {
                success: true,
            };
        }

        const resetToken =
            this.tokenService.generatePasswordResetToken(
                user.id
            );

        await this.emailService.sendForgotPasswordEmail(
            user.email,
            user.fullName,
            resetToken
        );

        return {
            success: true,
            message:
                "Password reset email sent",
        };
    }

    public async resetPassword(input: ResetPasswordInput) {
        const validatedInput =
            await resetPasswordInput.parseAsync(
                input
            );

        const payload =
            this.tokenService.verifyPasswordResetToken(
                validatedInput.token
            );

        const user =
            await this.findById(
                payload.userId
            );

        if (!user) {
            throw new Error(
                "User not found"
            );
        }

        const passwordHash = await this.hashPassword(validatedInput.newPassword);
        await db.update(usersTable).set({
            passwordHash: passwordHash
        }).where(eq(usersTable.id, user.id))

        return {
            success: true,
            message:
                "Password reset successfully",
        };
    }

    public async loginUserWithGoogle(input: LoginUserWithGoogleInput) {
        const validatedInput =
            await loginUserWithGoogleInput.parseAsync(
                input
            );

        const ticket =
            await googleOAuth2Client.verifyIdToken({
                idToken: validatedInput.idToken,
                audience: env.GOOGLE_OAUTH_CLIENT_ID,
            });

        const payload = ticket.getPayload();

        if (!payload?.email) {
            throw new Error(
                "Invalid Google account"
            );
        }

        let user = await this.findByEmail(
            payload.email
        );

        if (!user) {
            const [newUser] = await db
                .insert(usersTable)
                .values({
                    fullName:
                        payload.name ?? "Google User",
                    email: payload.email,
                    profileImageUrl:
                        payload.picture,
                    emailVerified: true,
                })
                .returning();

            user = newUser ?? null;
        }

        if (!user) {
            throw new Error(
                "Failed to create or retrieve Google user"
            );
        }

        const accessToken =
            this.tokenService.generateAccessToken(
                user.id
            );

        await db
            .update(usersTable)
            .set({
                lastLoginAt: new Date(),
            })
            .where(
                eq(usersTable.id, user.id)
            );

        return {
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                profileImageUrl:
                    user.profileImageUrl,
                emailVerified:
                    user.emailVerified,
            },
            accessToken,
        };
    }

    public async logoutUser(res: Response) {
        this.clearAuthCookies(res);

        return {
            success: true,
            message: "Logged out successfully",
        };
    }
}
