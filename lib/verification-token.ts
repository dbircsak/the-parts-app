import { prisma } from "@/lib/prisma";

export async function generateVerificationToken(email: string) {
  // Token expires in 24 hours
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Generate random token
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Store token in VerificationToken model
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: expiresAt,
    },
  });

  return token;
}

export async function verifyToken(email: string, token: string) {
  const record = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
  });

  if (!record) {
    return { valid: false, error: "Invalid or expired verification token" };
  }

  if (record.expires < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    });
    return { valid: false, error: "Token has expired" };
  }

  // Delete used token
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
  });

  return { valid: true };
}
