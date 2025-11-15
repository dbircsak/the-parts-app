import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DeliveriesPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const deliveries = await prisma.delivery.findMany({
    orderBy: { expectedDate: "asc" },
  });

  const pending = deliveries.filter((d) => d.status === "PENDING");
  const arrived = deliveries.filter((d) => d.status === "ARRIVED");
  const late = deliveries.filter((d) => d.status === "LATE");

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Deliveries</h1>

      <div className="grid gap-6 grid-cols-1">
        <Section title="Pending" deliveries={pending} />
        <Section title="Arrived" deliveries={arrived} />
        <Section title="Late" deliveries={late} />
      </div>

      {deliveries.length === 0 && (
        <p className="text-gray-500">No deliveries found.</p>
      )}
    </div>
  );
}

function Section({
  title,
  deliveries,
}: {
  title: string;
  deliveries: any[];
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">RO</th>
              <th className="text-left py-2">Vendor</th>
              <th className="text-left py-2">Expected Date</th>
              <th className="text-left py-2">Actual Date</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr key={d.id} className="border-b hover:bg-gray-50">
                <td className="py-2">{d.roNumber}</td>
                <td className="py-2">{d.vendorName}</td>
                <td className="py-2">{d.expectedDate.toLocaleDateString()}</td>
                <td className="py-2">
                  {d.actualDate?.toLocaleDateString() || "-"}
                </td>
                <td className="py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      d.status === "LATE"
                        ? "bg-red-100 text-red-800"
                        : d.status === "ARRIVED"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deliveries.length === 0 && (
        <p className="text-gray-500 text-sm">No deliveries in this category.</p>
      )}
    </div>
  );
}
