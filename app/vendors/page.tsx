import { prisma } from "@/lib/prisma";
import VendorTable from "@/components/VendorTable";

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { vendorName: "asc" },
  });

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Vendors</h1>
      <VendorTable vendors={vendors} />
    </div>
  );
}
