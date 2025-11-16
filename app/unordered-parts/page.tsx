import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UnorderedPartsList from "@/components/UnorderedPartsList";

export default async function UnorderedPartsPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  // Fetch unordered parts: ordered_qty = 0 AND received_qty = 0
  // Exclude: Sublet work, Aftermarket, Remanufactured
  const parts = await prisma.partsStatus.findMany({
    where: {
      orderedQty: 0,
      receivedQty: 0,
      roQty: {
        gt: 0,
      },
      partType: {
        not: "Sublet",
      },
      NOT: {
        OR: [
          {
            partNumber: {
              contains: "Aftermarket",
              mode: "insensitive",
            },
          },
          {
            partNumber: {
              contains: "Remanufactured",
              mode: "insensitive",
            },
          },
        ],
      },
    },
  });

  // Fetch daily_out data to get estimator and vehicle info
  const dailyOutRecords = await prisma.dailyOut.findMany();

  // Create a map for quick lookup
  const dailyOutMap = new Map(
    dailyOutRecords.map((record) => [record.roNumber, record])
  );

  // Enrich parts with daily_out data and filter out parts without RO
  const enrichedParts = parts
    .filter((part) => dailyOutMap.has(part.roNumber))
    .map((part) => {
      const dailyOut = dailyOutMap.get(part.roNumber)!;
      return {
        ...part,
        orderedDate: part.orderedDate ? part.orderedDate.toISOString() : null,
        expectedDelivery: part.expectedDelivery
          ? part.expectedDelivery.toISOString()
          : null,
        invoiceDate: part.invoiceDate ? part.invoiceDate.toISOString() : null,
        dailyOut: {
          ...dailyOut,
          partsReceivedPct: Number(dailyOut.partsReceivedPct),
          vehicleIn: dailyOut.vehicleIn.toISOString(),
          scheduledOut: dailyOut.scheduledOut
            ? dailyOut.scheduledOut.toISOString()
            : null,
          createdAt: dailyOut.createdAt.toISOString(),
          updatedAt: dailyOut.updatedAt.toISOString(),
        },
      };
    });

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Unordered Parts - Order Queue</h1>
      <UnorderedPartsList parts={enrichedParts} />
    </div>
  );
}
