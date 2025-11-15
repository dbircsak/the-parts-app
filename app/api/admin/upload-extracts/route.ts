import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  parseCSV,
  parseDate,
  parseNumber,
  parseBoolean,
} from "@/lib/csv-parser";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    const results: Record<string, any> = {};

    const dailyOutFile = formData.get("daily_out") as File;
    if (dailyOutFile) {
      const content = await dailyOutFile.text();
      const rows = await parseCSV(content);
      const result = await importDailyOut(rows);
      results.dailyOut = result;
    }

    const partsStatusFile = formData.get("parts_status") as File;
    if (partsStatusFile) {
      const content = await partsStatusFile.text();
      const rows = await parseCSV(content);
      const result = await importPartsStatus(rows);
      results.partsStatus = result;
    }

    const vendorsFile = formData.get("vendors") as File;
    if (vendorsFile) {
      const content = await vendorsFile.text();
      const rows = await parseCSV(content);
      const result = await importVendors(rows);
      results.vendors = result;
    }

    return NextResponse.json({
      success: true,
      message: "Import completed successfully",
      ...results,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed", message: String(error) },
      { status: 500 }
    );
  }
}

async function importDailyOut(rows: any[]) {
  let imported = 0;
  let errors = 0;

  await prisma.dailyOut.deleteMany();

  for (const row of rows) {
    try {
      const roNumber = parseNumber(row.ro_number);
      if (!roNumber) {
        errors++;
        continue;
      }

      await prisma.dailyOut.create({
        data: {
          roNumber,
          owner: row.owner || "",
          vehicle: row.vehicle || "",
          vehicleColor: row.vehicle_color || "",
          licensePlateNumber: row.license_plate_number || "",
          partsReceivedPct: parseNumber(row.parts_received_pct) || 0,
          vehicleIn: parseDate(row.vehicle_in) || new Date(),
          currentPhase: row.current_phase || "",
          scheduledOut: parseDate(row.scheduled_out),
          bodyTechnician: row.body_technician || "",
          estimator: row.estimator || "",
        },
      });

      imported++;
    } catch (err) {
      errors++;
    }
  }

  return { imported, errors };
}

async function importPartsStatus(rows: any[]) {
  let imported = 0;
  let errors = 0;

  await prisma.partsStatus.deleteMany();

  for (const row of rows) {
    try {
      const roNumber = parseNumber(row.ro_number);
      const line = parseNumber(row.line);
      if (!roNumber || !line) {
        errors++;
        continue;
      }

      await prisma.partsStatus.create({
        data: {
          roNumber,
          line,
          partNumber: row.part_number || "",
          partDescription: row.part_description || "",
          partType: row.part_type || "",
          vendorName: row.vendor_name || "",
          roQty: parseNumber(row.ro_qty) || 0,
          orderedQty: parseNumber(row.ordered_qty) || 0,
          orderedDate: parseDate(row.ordered_date),
          expectedDelivery: parseDate(row.expected_delivery),
          receivedQty: parseNumber(row.received_qty) || 0,
          invoiceDate: parseDate(row.invoice_date),
          returnedQty: parseNumber(row.returned_qty) || 0,
        },
      });

      imported++;
    } catch (err) {
      errors++;
    }
  }

  return { imported, errors };
}

async function importVendors(rows: any[]) {
  let imported = 0;
  let errors = 0;

  await prisma.vendor.deleteMany();

  for (const row of rows) {
    try {
      const vendorName = row.vendor_name?.trim();
      if (!vendorName) {
        errors++;
        continue;
      }

      await prisma.vendor.create({
        data: {
          vendorName,
          primaryPhone: row.primary_phone || "",
          fax: row.fax || "",
          address: row.address || "",
          city: row.city || "",
          state: (row.state || "").substring(0, 2),
          zip: row.zip || "",
          preferred: parseBoolean(row.preferred),
          electronic: parseBoolean(row.electronic),
        },
      });

      imported++;
    } catch (err) {
      errors++;
    }
  }

  return { imported, errors };
}
