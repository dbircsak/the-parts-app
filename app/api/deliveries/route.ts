import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all parts
    const parts = await prisma.partsStatus.findMany({
      orderBy: [
        { roNumber: "asc" },
        { vendorName: "asc" },
        { partNumber: "asc" },
      ],
    });

    // Fetch all cars
    const cars = await prisma.dailyOut.findMany();

    // Create a map of cars for quick lookup
    const carMap = new Map(cars.map((car) => [car.roNumber, car]));

    // Build car view: group by roNumber, then vendor, then parts
    const carViewMap = new Map();
    parts.forEach((part) => {
      const car = carMap.get(part.roNumber);
      const key = part.roNumber;
      if (!carViewMap.has(key)) {
        carViewMap.set(key, {
          roNumber: part.roNumber,
          owner: car?.owner || "",
          vehicle: car?.vehicle || "",
          bodyTechnician: car?.bodyTechnician || "",
          estimator: car?.estimator || "",
          vendors: {},
        });
      }

      const carData = carViewMap.get(key);
      if (!carData.vendors[part.vendorName]) {
        carData.vendors[part.vendorName] = {
          vendorName: part.vendorName,
          parts: [],
        };
      }

      carData.vendors[part.vendorName].parts.push({
        partDescription: part.partDescription,
        partNumber: part.partNumber,
        receivedQty: part.receivedQty,
        invoiceDate: part.invoiceDate ? part.invoiceDate.toISOString() : null,
      });
    });

    // Convert vendors object to array
    const carView = Array.from(carViewMap.values()).map((car: any) => ({
      ...car,
      vendors: Object.values(car.vendors),
    }));

    // Build vendor view: group by vendorName, then roNumber, then parts
    const vendorViewMap = new Map();
    parts.forEach((part) => {
      const car = carMap.get(part.roNumber);
      const vendorKey = part.vendorName;
      if (!vendorViewMap.has(vendorKey)) {
        vendorViewMap.set(vendorKey, {
          vendorName: part.vendorName,
          cars: {},
        });
      }

      const vendor = vendorViewMap.get(vendorKey);
      const carKey = part.roNumber;
      if (!vendor.cars[carKey]) {
        vendor.cars[carKey] = {
          roNumber: part.roNumber,
          owner: car?.owner || "",
          vehicle: car?.vehicle || "",
          bodyTechnician: car?.bodyTechnician || "",
          estimator: car?.estimator || "",
          parts: [],
        };
      }

      vendor.cars[carKey].parts.push({
        partDescription: part.partDescription,
        partNumber: part.partNumber,
        receivedQty: part.receivedQty,
        invoiceDate: part.invoiceDate ? part.invoiceDate.toISOString() : null,
      });
    });

    // Convert cars object to array and sort by roNumber
    const vendorView = Array.from(vendorViewMap.values()).map((vendor: any) => ({
      ...vendor,
      cars: Object.values(vendor.cars).sort(
        (a: any, b: any) => a.roNumber - b.roNumber
      ),
    }));

    return NextResponse.json({
      carView,
      vendorView,
    });
  } catch (error) {
    console.error("Failed to fetch deliveries:", error);
    return NextResponse.json(
      { error: "Failed to fetch deliveries" },
      { status: 500 }
    );
  }
}
