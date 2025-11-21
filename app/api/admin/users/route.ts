import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, validatePassword } from "@/lib/crypto";
import { generateVerificationToken } from "@/lib/verification-token";
import { sendVerificationEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { email: "asc" },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { email, name, password, role } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const validation = validatePassword(password);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "User already exists" },
      { status: 400 }
    );
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      name: name || email,
      password: hashedPassword,
      role: role || "TECHNICIAN",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  // Generate verification token and send email
  try {
    const verificationToken = await generateVerificationToken(email);
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}`;

    await sendVerificationEmail(email, verificationUrl, name || email);
  } catch (err) {
    console.error("Failed to send verification email:", err);
    // Don't fail user creation if email fails, but log it
  }

  return NextResponse.json(user, { status: 201 });
}
