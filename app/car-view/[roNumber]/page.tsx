import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CarViewPartsList from "@/components/CarViewPartsList";
import Card from "@/components/Card";
import Alert from "@/components/Alert";

export default async function CarViewPage({
  params,
}: {
  params: Promise<{ roNumber: string }>;
}) {
  const { roNumber: roNumberStr } = await params;
  const roNumber = parseInt(roNumberStr, 10);
  if (isNaN(roNumber)) {
    notFound();
  }

  // Fetch RO header data from daily_out
  const roHeader = await prisma.dailyOut.findUnique({
    where: { roNumber },
  });

  // Fetch all parts for this RO from parts_status
  const parts = await prisma.partsStatus.findMany({
    where: { 
      roNumber,
      roQty: { gt: 0 },
    },
    orderBy: { line: "asc" },
  });

  // If no header and no parts, show 404
  if (!roHeader && parts.length === 0) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Car View - RO {roNumber}</h1>

      {/* RO Header Section */}
      {roHeader && (
        <Card className="mb-6">
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
        </Card>
      )}
      {!roHeader && (
        <Alert type="warning" className="mb-6">
          No RO data found in database.
        </Alert>
      )}

      {/* Parts List Section */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Parts List ({parts.length})</h2>
        <CarViewPartsList parts={parts} />
      </Card>
    </div>
  );
}
