import { Resend } from "resend";
import { env } from "../env.js";

const resend = new Resend(env.RESEND_API_KEY);

export class EmailService {
  private appUrl = env.APP_URL;

  public async sendVerificationEmail(
    email: string,
    fullName: string,
    token: string
  ) {
    const verificationUrl =
      `${this.appUrl}/verify-email?token=${token}`;

    return resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: "Verify your Stellix account",
      html: `
        <h1>Welcome ${fullName}</h1>

        <p>
          Thank you for creating your Stellix account.
        </p>

        <p>
          Please verify your email address by clicking the button below.
        </p>

        <p>
          <a href="${verificationUrl}">
            Verify Email
          </a>
        </p>

        <p>
          If you did not create this account, you can safely ignore this email.
        </p>
      `,
    });
  }

  public async sendForgotPasswordEmail(
    email: string,
    fullName: string,
    token: string
  ) {
    const resetUrl =
      `${this.appUrl}/reset-password?token=${token}`;

    return resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: "Reset your Stellix password",
      html: `
        <h1>Hello ${fullName}</h1>

        <p>
          We received a request to reset your password.
        </p>

        <p>
          Click the link below to set a new password.
        </p>

        <p>
          <a href="${resetUrl}">
            Reset Password
          </a>
        </p>

        <p>
          If you did not request a password reset,
          you can safely ignore this email.
        </p>
      `,
    });
  }

  public async sendWelcomeEmail(
    email: string,
    fullName: string
  ) {
    return resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: "Welcome to Stellix",
      html: `
        <h1>Welcome ${fullName}</h1>

        <p>
          Your email has been verified successfully.
        </p>

        <p>
          Welcome to Stellix.
        </p>

        <p>
          We're excited to help you turn outcomes into execution.
        </p>
      `,
    });
  }
}
