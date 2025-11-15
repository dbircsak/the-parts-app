import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q");

  if (!q) {
    return NextResponse.json([]);
  }

  const query = q.toLowerCase();

  const parts = await prisma.partsStatus.findMany({
    where: {
      OR: [
        { roNumber: { equals: parseInt(q) || 0 } },
        {
          partNumber: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          partDescription: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          vendorName: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    take: 100,
  });

  return NextResponse.json(parts);
}
