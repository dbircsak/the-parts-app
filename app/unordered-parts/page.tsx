import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function UnorderedPartsPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const parts = await prisma.partsStatus.findMany({
    where: {
      orderedQty: 0,
      roQty: {
        gt: 0,
      },
    },
    orderBy: { roNumber: "desc" },
  });

  const byEstimator = parts.reduce(
    (acc, part) => {
      const repairs = Array.isArray(part) ? part : [part];
      return acc;
    },
    {} as Record<string, typeof parts>
  );

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Unordered Parts</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">RO</th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Part Number
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Description
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">Qty</th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Vendor
                </th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part) => (
                <tr key={part.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm font-medium">
                    {part.roNumber}
                  </td>
                  <td className="px-4 py-2 text-sm font-mono">
                    {part.partNumber}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {part.partDescription}
                  </td>
                  <td className="px-4 py-2 text-sm">{part.roQty}</td>
                  <td className="px-4 py-2 text-sm">{part.vendorName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {parts.length === 0 && (
        <p className="text-gray-500">All parts are ordered.</p>
      )}
    </div>
  );
}
