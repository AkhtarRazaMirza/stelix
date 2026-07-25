import jwt from "jsonwebtoken";
import type { JwtPayload, Secret } from "jsonwebtoken";
import { env } from "../env.js";

export interface TokenPayload extends JwtPayload {
    userId: string;
}

// Pin the signing algorithm explicitly. Without this, jwt.verify accepts any
// algorithm in its default allow-list, which opens the door to algorithm-
// confusion attacks (e.g. a token forged with "none" or an asymmetric alg).
// HS256 matches how these HMAC secrets are used for signing.
const ALGORITHM = "HS256" as const;

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
                algorithm: ALGORITHM,
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
                algorithm: ALGORITHM,
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
            env.JWT_ACCESS_TOKEN_SECRET as Secret,
            { algorithms: [ALGORITHM] }
        ) as TokenPayload;
    }

    public verifyEmailVerificationToken(
        token: string
    ): TokenPayload {
        return jwt.verify(
            token,
            env.JWT_EMAIL_VARIFICATION_TOKEN_SECRET as Secret,
            { algorithms: [ALGORITHM] }
        ) as TokenPayload;
    }

    public generatePasswordResetToken(
        userId: string
    ): string {
        return jwt.sign(
            { userId },
            env.JWT_PASSWORD_RESET_SECRET as Secret,
            {
                algorithm: ALGORITHM,
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
            env.JWT_PASSWORD_RESET_SECRET as Secret,
            { algorithms: [ALGORITHM] }
        ) as TokenPayload;
    }

}