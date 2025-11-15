import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function PaintListPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const repairs = await prisma.dailyOut.findMany({
    where: {
      OR: [
        { currentPhase: { contains: "Paint", mode: "insensitive" } },
        { currentPhase: { contains: "paint", mode: "insensitive" } },
      ],
    },
    orderBy: { vehicleIn: "asc" },
  });

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Paint List</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">RO</th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Vehicle
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Color
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Owner
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Scheduled Out
                </th>
              </tr>
            </thead>
            <tbody>
              {repairs.map((repair) => (
                <tr key={repair.roNumber} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm font-medium">
                    {repair.roNumber}
                  </td>
                  <td className="px-4 py-2 text-sm">{repair.vehicle}</td>
                  <td className="px-4 py-2 text-sm">{repair.vehicleColor}</td>
                  <td className="px-4 py-2 text-sm">{repair.owner}</td>
                  <td className="px-4 py-2 text-sm">
                    {repair.scheduledOut?.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {repairs.length === 0 && (
        <p className="text-gray-500">No vehicles in paint queue.</p>
      )}
    </div>
  );
}
