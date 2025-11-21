import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/verification-token";
import { sendWelcomeEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, token } = await request.json();

  if (!email || !token) {
    return NextResponse.json(
      { error: "Email and token are required" },
      { status: 400 }
    );
  }

  // Verify the token
  const verification = await verifyToken(email, token);
  if (!verification.valid) {
    return NextResponse.json(
      { error: verification.error },
      { status: 400 }
    );
  }

  // Mark user email as verified
  const user = await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
    select: { id: true, email: true, name: true },
  });

  // Send welcome email
  try {
    await sendWelcomeEmail(user.email, user.name || undefined);
  } catch (err) {
    console.error("Failed to send welcome email:", err);
    // Don't fail the verification if welcome email fails
  }

  return NextResponse.json({
    success: true,
    message: "Email verified successfully",
  });
}
