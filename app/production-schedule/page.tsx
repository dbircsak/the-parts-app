import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ProductionSchedulePage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const repairs = await prisma.dailyOut.findMany({
    orderBy: { vehicleIn: "desc" },
  });

  const byTechnician = repairs.reduce(
    (acc, repair) => {
      const tech = repair.bodyTechnician || "Unassigned";
      if (!acc[tech]) acc[tech] = [];
      acc[tech].push(repair);
      return acc;
    },
    {} as Record<string, typeof repairs>
  );

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Production Schedule</h1>

      <div className="space-y-6">
        {Object.entries(byTechnician).map(([tech, jobs]) => (
          <div key={tech} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{tech}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">RO</th>
                    <th className="text-left py-2">Vehicle</th>
                    <th className="text-left py-2">Phase</th>
                    <th className="text-left py-2">Parts %</th>
                    <th className="text-left py-2">Scheduled Out</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.roNumber} className="border-b hover:bg-gray-50">
                      <td className="py-2">{job.roNumber}</td>
                      <td className="py-2">{job.vehicle}</td>
                      <td className="py-2">{job.currentPhase}</td>
                      <td className="py-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${Number(job.partsReceivedPct)}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-2">
                        {job.scheduledOut?.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {repairs.length === 0 && (
        <p className="text-gray-500">No active repair orders.</p>
      )}
    </div>
  );
}
