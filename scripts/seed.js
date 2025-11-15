const { PrismaClient } = require("@prisma/client");
const { hashPassword } = require("../lib/auth");

const prisma = new PrismaClient();

async function seed() {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@partsapp.local" },
    });

    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    const hashedPassword = await hashPassword("admin");

    const admin = await prisma.user.create({
      data: {
        email: "admin@partsapp.local",
        name: "Administrator",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("Seeding completed. Admin user created:");
    console.log(`Email: ${admin.email}`);
    console.log("Password: admin (change immediately)");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
