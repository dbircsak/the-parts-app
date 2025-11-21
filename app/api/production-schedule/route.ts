import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { countPartsByStatus, calculatePartsReceivedPercentage, filterDisplayableParts } from "@/lib/count-parts-by-status";

interface CarData {
  roNumber: number;
  owner: string;
  vehicle: string;
  vehicleColor: string;
  bodyTechnician: string;
  estimator: string;
  scheduledOut: string | null;
  partsReceivedPct: number;
  not_ordered: number;
  on_order: number;
  received: number;
  returned: number;
}

interface GroupedData {
  name: string;
  cars: CarData[];
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all repair orders
    const cars = await prisma.dailyOut.findMany({
      orderBy: { vehicleIn: "desc" },
    });

    // Get all parts status
    const allParts = await prisma.partsStatus.findMany();
    
    // Filter to only displayable parts (roQty > 0 and not Sublet)
    // This uses the same filtering logic as car-view
    const displayableParts = filterDisplayableParts(allParts);

    // Create a map of RO to displayable parts for quick lookup
    const partsByRO = new Map<number, typeof displayableParts>();
    displayableParts.forEach((part) => {
      if (!partsByRO.has(part.roNumber)) {
        partsByRO.set(part.roNumber, []);
      }
      partsByRO.get(part.roNumber)!.push(part);
    });

    // Calculate part statuses for each car using shared counting logic
    const carsWithPartStatus: CarData[] = cars.map((car) => {
      const parts = partsByRO.get(car.roNumber) || [];

      // Use shared counting logic to ensure consistency across all pages
      const statusCounts = countPartsByStatus(parts);
      const partsReceivedPct = calculatePartsReceivedPercentage(statusCounts);

      return {
        roNumber: car.roNumber,
        owner: car.owner,
        vehicle: car.vehicle,
        vehicleColor: car.vehicleColor,
        bodyTechnician: car.bodyTechnician,
        estimator: car.estimator,
        scheduledOut: car.scheduledOut ? car.scheduledOut.toISOString() : null,
        partsReceivedPct,
        not_ordered: statusCounts.not_ordered,
        on_order: statusCounts.on_order,
        received: statusCounts.received,
        returned: statusCounts.returned,
      };
    });

    // Group by estimator
    const byEstimator = new Map<string, CarData[]>();
    carsWithPartStatus.forEach((car) => {
      const estimator = car.estimator || "Unassigned";
      if (!byEstimator.has(estimator)) {
        byEstimator.set(estimator, []);
      }
      byEstimator.get(estimator)!.push(car);
    });

    // Group by technician
    const byTechnician = new Map<string, CarData[]>();
    carsWithPartStatus.forEach((car) => {
      const tech = car.bodyTechnician || "Unassigned";
      if (!byTechnician.has(tech)) {
        byTechnician.set(tech, []);
      }
      byTechnician.get(tech)!.push(car);
    });

    // Convert maps to sorted arrays
    const estimatorView: GroupedData[] = Array.from(byEstimator.entries())
      .map(([name, cars]) => ({ name, cars }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const technicianView: GroupedData[] = Array.from(byTechnician.entries())
      .map(([name, cars]) => ({ name, cars }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Return both views (client will use based on selected mode)
    return NextResponse.json({
      estimator: estimatorView,
      technician: technicianView,
    });
  } catch (error) {
    console.error("Failed to fetch production schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch production schedule" },
      { status: 500 }
    );
  }
}
