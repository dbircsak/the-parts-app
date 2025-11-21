import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import PaintWorkQueue from "@/components/PaintWorkQueue";

export default async function PaintListPage() {
  const session = await auth();
  const isGuest = !session;

  // Fetch cars in paint queue, ordered by status and priority
  const paintQueue = await prisma.workQueue.findMany({
    where: {
      departmentCode: "P", // Paint department
    },
    include: {
      dailyOut: true,
    },
    orderBy: [
      { status: "asc" },
      { priority: "asc" },
      { createdAt: "asc" },
    ],
  });

  // Fetch available cars NOT yet in paint work queue
  const availableCars = await prisma.dailyOut.findMany({
    where: {
      NOT: {
        workQueue: {
          departmentCode: "P",
        },
      },
    },
    orderBy: {
      vehicleIn: "asc",
    },
  });

  // Fetch all distinct technicians (body technicians)
  const allTechnicians = await prisma.dailyOut.findMany({
    distinct: ["bodyTechnician"],
    select: {
      bodyTechnician: true,
    },
    orderBy: {
      bodyTechnician: "asc",
    },
  });

  // Transform data
  const queueData = paintQueue.map((item) => ({
    roNumber: item.roNumber,
    owner: item.dailyOut.owner,
    vehicle: item.dailyOut.vehicle,
    bodyTechnician: item.dailyOut.bodyTechnician,
    estimator: item.dailyOut.estimator,
    status: item.status,
    priority: item.priority,
  }));

  const availableData = availableCars.map((car) => ({
    roNumber: car.roNumber,
    owner: car.owner,
    vehicle: car.vehicle,
    bodyTechnician: car.bodyTechnician,
    estimator: car.estimator,
  }));

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Paint List</h1>
      <PaintWorkQueue 
        queuedCars={queueData} 
        availableCars={availableData}
        allTechnicians={allTechnicians.map((t) => t.bodyTechnician).filter((t) => t)}
        isGuest={isGuest}
      />
    </div>
  );
}
