import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function getPartStatus(roQty: number, orderedQty: number, receivedQty: number, returnedQty: number): string {
  if (returnedQty > 0 && returnedQty === receivedQty) {
    return "returned";
  }
  if (receivedQty > 0) {
    return "received";
  }
  if (orderedQty > 0 && receivedQty === 0) {
    return "on_order";
  }
  return "not_ordered";
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const status = request.nextUrl.searchParams.get("status");
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  const pageSize = 50;

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

    // Fetch all matching parts (without pagination yet, to apply status filter)
    const allParts = await prisma.partsStatus.findMany({
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
    });

    // Apply status filter in-memory (handles complex comparisons like returnedQty === receivedQty)
    let filteredParts = allParts;
    if (status && status !== "all") {
      filteredParts = allParts.filter(
        (part) => getPartStatus(part.roQty, part.orderedQty, part.receivedQty, part.returnedQty) === status
      );
    }

    // Now apply pagination
    const total = filteredParts.length;
    const skip = (page - 1) * pageSize;
    const paginatedParts = filteredParts.slice(skip, skip + pageSize);

    // Batch fetch owner data for these parts
    const roNumbers = [...new Set(paginatedParts.map((p) => p.roNumber))];
    const dailyOutRecords = await prisma.dailyOut.findMany({
      where: { roNumber: { in: roNumbers } },
      select: { roNumber: true, owner: true },
    });

    const ownerMap = new Map(dailyOutRecords.map((r) => [r.roNumber, r.owner]));

    // Enrich parts with owner data
    const enrichedParts = paginatedParts.map((part) => ({
      ...part,
      owner: ownerMap.get(part.roNumber) || "Unknown",
    }));

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
