import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  verificationUrl: string,
  name?: string
) {
  try {
    const result = await resend.emails.send({
      from: "noreply@resend.dev", // Update this to your actual domain
      to: email,
      subject: "Verify your email address",
      html: `
        <h2>Welcome${name ? ` ${name}` : ""}!</h2>
        <p>Please verify your email address to activate your account.</p>
        <p>
          <a href="${verificationUrl}" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p>Or copy and paste this link: ${verificationUrl}</p>
        <p>This link expires in 24 hours.</p>
      `,
    });

    return result;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, name?: string) {
  try {
    const result = await resend.emails.send({
      from: "noreply@resend.dev", // Update this to your actual domain
      to: email,
      subject: "Welcome to The Parts App",
      html: `
        <h2>Welcome${name ? ` ${name}` : ""}!</h2>
        <p>Your email has been verified and your account is now active.</p>
        <p>You can now log in at any time.</p>
      `,
    });

    return result;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw error;
  }
}
