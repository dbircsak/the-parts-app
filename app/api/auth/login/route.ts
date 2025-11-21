import { rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email } = await request.json();

  // Rate limit by email address
  const limit = rateLimit(email, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes

  if (!limit.success) {
    return NextResponse.json(
      {
        error: `Too many login attempts. Please try again in ${limit.retryAfter} seconds.`,
      },
      { status: 429 }
    );
  }

  return NextResponse.json({
    success: true,
    remaining: limit.remaining,
  });
}
