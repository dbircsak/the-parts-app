import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PartsSearchClient from "@/components/parts-search-client";

export default async function PartsSearchPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const parts = await prisma.partsStatus.findMany({
    where: {
      roQty: { gt: 0 },
    },
    take: 1000,
  });

  // Fetch daily_out data to get owner information
  const dailyOutMap = await prisma.dailyOut.findMany().then((records) => {
    const map = new Map();
    records.forEach((record) => {
      map.set(record.roNumber, record.owner);
    });
    return map;
  });

  // Enrich parts with owner data and filter out parts without owners
  const enrichedParts = parts
    .map((part) => ({
      ...part,
      owner: dailyOutMap.get(part.roNumber),
    }))
    .filter((part) => part.owner !== undefined);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Parts Search</h1>
      <PartsSearchClient initialParts={enrichedParts} />
    </div>
  );
}
