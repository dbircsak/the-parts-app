import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const roNumber = url.searchParams.get("roNumber");

    if (!roNumber) {
      return NextResponse.json({ error: "RO number is required" }, { status: 400 });
    }

    const roNum = parseInt(roNumber, 10);
    if (isNaN(roNum)) {
      return NextResponse.json({ error: "RO number must be a number" }, { status: 400 });
    }

    // Fetch car data
    const dailyOut = await prisma.dailyOut.findUnique({
      where: { roNumber: roNum },
    });

    // Fetch all parts for this RO
    const parts = await prisma.partsStatus.findMany({
      where: { roNumber: roNum },
      orderBy: { line: "asc" },
    });

    // Fetch work queue data
    const workQueue = await prisma.workQueue.findUnique({
      where: { roNumber: roNum },
    });

    return NextResponse.json({
      roNumber: roNum,
      dailyOut,
      parts,
      workQueue,
      summary: {
        totalParts: parts.length,
        partsWithRoQty: parts.filter((p) => p.roQty > 0).length,
        partsWithoutRoQty: parts.filter((p) => p.roQty === 0).length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch debug data:", error);
    return NextResponse.json(
      { error: "Failed to fetch debug data" },
      { status: 500 }
    );
  }
}
