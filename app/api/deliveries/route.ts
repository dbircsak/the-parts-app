import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupBy = searchParams.get("groupBy") || "car";

    // Validate groupBy parameter
    if (!["car", "vendor"].includes(groupBy)) {
      return NextResponse.json(
        { error: "Invalid groupBy parameter. Must be 'car' or 'vendor'" },
        { status: 400 }
      );
    }

    // Fetch all cars first
    const cars = await prisma.dailyOut.findMany();

    // Create a map of cars for quick lookup
    const carMap = new Map(cars.map((car) => [car.roNumber, car]));

    // Fetch all parts that have matching daily_out entries and a vendor name
    const parts = await prisma.partsStatus.findMany({
      where: {
        roNumber: {
          in: Array.from(carMap.keys()),
        },
        vendorName: {
          not: "",
        },
      },
      orderBy: [
        { roNumber: "asc" },
        { vendorName: "asc" },
        { partNumber: "asc" },
      ],
    });

    let result;

    if (groupBy === "car") {
      // Build car view: group by roNumber, then vendor, then parts
      const carViewMap = new Map<
        number,
        {
          roNumber: number;
          owner: string;
          vehicle: string;
          bodyTechnician: string;
          estimator: string;
          vehicleIn: string;
          currentPhase: string;
          vendors: Map<
            string,
            {
              vendorName: string;
              parts: {
                partDescription: string;
                partNumber: string;
                receivedQty: number;
                invoiceDate: string | null;
              }[];
            }
          >;
        }
      >();

      parts.forEach((part) => {
        const car = carMap.get(part.roNumber);
        const carKey = part.roNumber;

        if (!carViewMap.has(carKey)) {
          carViewMap.set(carKey, {
            roNumber: part.roNumber,
            owner: car?.owner || "",
            vehicle: car?.vehicle || "",
            bodyTechnician: car?.bodyTechnician || "",
            estimator: car?.estimator || "",
            vehicleIn: car?.vehicleIn.toISOString() || "",
            currentPhase: car?.currentPhase || "",
            vendors: new Map(),
          });
        }

        const carData = carViewMap.get(carKey)!;
        if (!carData.vendors.has(part.vendorName)) {
          carData.vendors.set(part.vendorName, {
            vendorName: part.vendorName,
            parts: [],
          });
        }

        carData.vendors.get(part.vendorName)!.parts.push({
          partDescription: part.partDescription,
          partNumber: part.partNumber,
          receivedQty: part.receivedQty,
          invoiceDate: part.invoiceDate ? part.invoiceDate.toISOString() : null,
        });
      });

      // Convert vendors map to array
      const carView = Array.from(carViewMap.values()).map((car) => ({
        ...car,
        vendors: Array.from(car.vendors.values()),
      }));

      result = { cars: carView };
    } else {
      // Build vendor view: group by vendorName, then roNumber, then parts
      const vendorViewMap = new Map<
        string,
        {
          vendorName: string;
          cars: Map<
            number,
            {
              roNumber: number;
              owner: string;
              vehicle: string;
              bodyTechnician: string;
              estimator: string;
              vehicleIn: string;
              currentPhase: string;
              parts: {
                partDescription: string;
                partNumber: string;
                receivedQty: number;
                invoiceDate: string | null;
              }[];
            }
          >;
        }
      >();

      parts.forEach((part) => {
        const car = carMap.get(part.roNumber);
        const vendorKey = part.vendorName;

        if (!vendorViewMap.has(vendorKey)) {
          vendorViewMap.set(vendorKey, {
            vendorName: part.vendorName,
            cars: new Map(),
          });
        }

        const vendor = vendorViewMap.get(vendorKey)!;
        const carKey = part.roNumber;

        if (!vendor.cars.has(carKey)) {
          vendor.cars.set(carKey, {
            roNumber: part.roNumber,
            owner: car?.owner || "",
            vehicle: car?.vehicle || "",
            bodyTechnician: car?.bodyTechnician || "",
            estimator: car?.estimator || "",
            vehicleIn: car?.vehicleIn.toISOString() || "",
            currentPhase: car?.currentPhase || "",
            parts: [],
          });
        }

        vendor.cars.get(carKey)!.parts.push({
          partDescription: part.partDescription,
          partNumber: part.partNumber,
          receivedQty: part.receivedQty,
          invoiceDate: part.invoiceDate ? part.invoiceDate.toISOString() : null,
        });
      });

      // Convert cars map to array and sort by roNumber
      const vendorView = Array.from(vendorViewMap.values()).map((vendor) => ({
        ...vendor,
        cars: Array.from(vendor.cars.values()).sort(
          (a, b) => a.roNumber - b.roNumber
        ),
      }));

      result = { vendors: vendorView };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch deliveries:", error);
    return NextResponse.json(
      { error: "Failed to fetch deliveries" },
      { status: 500 }
    );
  }
}
