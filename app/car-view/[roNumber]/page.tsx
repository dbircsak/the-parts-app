import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import CarViewPartsList from "@/components/car-view-parts-list";

export default async function CarViewPage({
  params,
}: {
  params: Promise<{ roNumber: string }>;
}) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const { roNumber: roNumberStr } = await params;
  const roNumber = parseInt(roNumberStr, 10);
  if (isNaN(roNumber)) {
    notFound();
  }

  // Fetch RO header data from daily_out
  const roHeader = await prisma.dailyOut.findUnique({
    where: { roNumber },
  });

  if (!roHeader) {
    notFound();
  }

  // Fetch all parts for this RO from parts_status
  const parts = await prisma.partsStatus.findMany({
    where: { roNumber },
    orderBy: { line: "asc" },
  });

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Car View - RO {roNumber}</h1>

      {/* RO Header Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {/* Row 1: Owner, Vehicle Color, Estimator, Vehicle In */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm"><span className="text-gray-600">Owner:</span> <span className="font-medium">{roHeader.owner}</span></p>
          </div>
          <div>
            <p className="text-sm"><span className="text-gray-600">Vehicle Color:</span> <span className="font-medium">{roHeader.vehicleColor}</span></p>
          </div>
          <div>
            <p className="text-sm"><span className="text-gray-600">Estimator:</span> <span className="font-medium">{roHeader.estimator}</span></p>
          </div>
          <div>
            <p className="text-sm"><span className="text-gray-600">Vehicle In:</span> <span className="font-medium">{roHeader.vehicleIn.toLocaleDateString()}</span></p>
          </div>
        </div>

        {/* Row 2: Vehicle, License Plate, Body Technician, Scheduled Out */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-sm"><span className="text-gray-600">Vehicle:</span> <span className="font-medium">{roHeader.vehicle}</span></p>
          </div>
          <div>
            <p className="text-sm"><span className="text-gray-600">License Plate:</span> <span className="font-medium">{roHeader.licensePlateNumber}</span></p>
          </div>
          <div>
            <p className="text-sm"><span className="text-gray-600">Body Technician:</span> <span className="font-medium">{roHeader.bodyTechnician}</span></p>
          </div>
          <div>
            <p className="text-sm"><span className="text-gray-600">Scheduled Out:</span> <span className="font-medium">{roHeader.scheduledOut?.toLocaleDateString() || "-"}</span></p>
          </div>
        </div>
      </div>

      {/* Parts List Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Parts List ({parts.length})</h2>
        <CarViewPartsList parts={parts} />
      </div>
    </div>
  );
}
