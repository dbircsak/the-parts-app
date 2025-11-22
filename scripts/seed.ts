import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";
import * as fs from "fs";
import * as path from "path";
import Papa from "papaparse";

const prisma = new PrismaClient();

async function seedMaterials() {
  const csvPath = path.join(__dirname, "../samples/materials_sample.csv");

  if (!fs.existsSync(csvPath)) {
    console.log("Materials CSV file not found, skipping materials seeding");
    return;
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");

  return new Promise<void>((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as Array<Record<string, string>>;

          for (const row of rows) {
            const receivedDate = row.receivedDate ? new Date(row.receivedDate) : null;
            const orderedDate = row.orderedDate ? new Date(row.orderedDate) : null;

            await prisma.material.create({
              data: {
                bodyTechnician: row.bodyTechnician,
                partNumber: row.partNumber,
                description: row.description,
                orderedQty: parseInt(row.orderedQty, 10),
                orderedDate,
                unitType: row.unitType,
                receivedQty: parseInt(row.receivedQty, 10) || 0,
                receivedDate,
              },
            });
          }

          console.log(`Materials seeded: ${rows.length} materials added`);
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

async function seed() {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@partsapp.local" },
    });

    if (!existingAdmin) {
      const hashedPassword = await hashPassword("admin");

      const admin = await prisma.user.create({
        data: {
          email: "admin@partsapp.local",
          name: "Administrator",
          password: hashedPassword,
          role: "ADMIN",
        },
      });

      console.log("Admin user created:");
      console.log(`Email: ${admin.email}`);
      console.log("Password: admin (change immediately)");
    } else {
      console.log("Admin user already exists");
    }

    // Seed materials
    await seedMaterials();

    console.log("Seeding completed");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
