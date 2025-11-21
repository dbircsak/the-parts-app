import { prisma } from "@/lib/prisma";
import MaterialsClient from "./MaterialsClient";

export default async function MaterialsPage() {
  const materials = await prisma.material.findMany({
    orderBy: { orderedDate: "desc" },
  });

  const bodyTechnicians = await prisma.dailyOut.findMany({
    select: { bodyTechnician: true },
    distinct: ["bodyTechnician"],
    orderBy: { bodyTechnician: "asc" },
  });

  const uniqueBodyTechnicians = bodyTechnicians
    .map(b => b.bodyTechnician)
    .filter((name) => name && name.trim() !== "");

  return <MaterialsClient initialMaterials={materials} bodyTechnicians={uniqueBodyTechnicians} />;
}
