import jwt from "jsonwebtoken";
import type { JwtPayload, Secret } from "jsonwebtoken";
import { env } from "../env.js";

export interface TokenPayload extends JwtPayload {
    userId: string;
}

export class TokenService {
    private accessTokenExpiresIn =
        env.JWT_ACCESS_TOKEN_EXPIRES_IN;

    private emailVerificationTokenExpiresIn =
        env.JWT_EMAIL_VARIFICATION_TOKEN_EXPIRES_IN;

    public generateAccessToken(userId: string): string {
        return jwt.sign(
            { userId },
            env.JWT_ACCESS_TOKEN_SECRET as Secret,
            {
                expiresIn: this.accessTokenExpiresIn as any,
            }
        );
    }

    public generateEmailVerificationToken(
        userId: string
    ): string {
        return jwt.sign(
            { userId },
            env.JWT_EMAIL_VARIFICATION_TOKEN_SECRET as Secret,
            {
                expiresIn:
                    this.emailVerificationTokenExpiresIn as any,
            }
        );
    }

    public verifyAccessToken(
        token: string
    ): TokenPayload {
        return jwt.verify(
            token,
            env.JWT_ACCESS_TOKEN_SECRET as Secret
        ) as TokenPayload;
    }

    public verifyEmailVerificationToken(
        token: string
    ): TokenPayload {
        return jwt.verify(
            token,
            env.JWT_EMAIL_VARIFICATION_TOKEN_SECRET as Secret
        ) as TokenPayload;
    }

    public generatePasswordResetToken(
        userId: string
    ): string {
        return jwt.sign(
            { userId },
            env.JWT_PASSWORD_RESET_SECRET as Secret,
            {
                expiresIn:
                    env.JWT_PASSWORD_RESET_EXPIRES_IN as any,
            }
        );
    }

    public verifyPasswordResetToken(
        token: string
    ): TokenPayload {
        return jwt.verify(
            token,
            env.JWT_PASSWORD_RESET_SECRET as Secret
        ) as TokenPayload;
    }

}