import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { comparePasswords } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export const authConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;

        // Rate limit login attempts
        const limit = rateLimit(email, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes
        if (!limit.success) {
          throw new Error(
            `Too many login attempts. Please try again in ${limit.retryAfter} seconds.`
          );
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return null;
        }

        const isValid = await comparePasswords(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
} satisfies NextAuthConfig;
