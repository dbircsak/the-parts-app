import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  const pageSize = 50;
  const skip = (page - 1) * pageSize;

  try {
    let where: any = {
      roQty: { gt: 0 },
    };

    // Apply search filter if provided
    if (q && q.trim()) {
      const query = q.toLowerCase();
      where = {
        ...where,
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
      };
    }

    // Fetch parts with owner data (join via roNumber)
    const parts = await prisma.partsStatus.findMany({
      where,
      select: {
        id: true,
        roNumber: true,
        line: true,
        partNumber: true,
        partDescription: true,
        partType: true,
        vendorName: true,
        roQty: true,
        orderedQty: true,
        orderedDate: true,
        expectedDelivery: true,
        receivedQty: true,
        invoiceDate: true,
        returnedQty: true,
      },
      orderBy: { roNumber: "asc" },
      skip,
      take: pageSize,
    });

    // Batch fetch owner data for these parts
    const roNumbers = [...new Set(parts.map((p) => p.roNumber))];
    const dailyOutRecords = await prisma.dailyOut.findMany({
      where: { roNumber: { in: roNumbers } },
      select: { roNumber: true, owner: true },
    });

    const ownerMap = new Map(dailyOutRecords.map((r) => [r.roNumber, r.owner]));

    // Enrich parts with owner data
    const enrichedParts = parts.map((part) => ({
      ...part,
      owner: ownerMap.get(part.roNumber) || "Unknown",
    }));

    // Get total count for pagination
    const total = await prisma.partsStatus.count({ where });

    return NextResponse.json({
      data: enrichedParts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Failed to fetch parts:", error);
    return NextResponse.json(
      { error: "Failed to fetch parts" },
      { status: 500 }
    );
  }
}
