import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import MaterialsClient from "./MaterialsClient";

export default async function MaterialsPage() {
  const session = await auth();
  const isGuest = !session;

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

  return <MaterialsClient initialMaterials={materials} bodyTechnicians={uniqueBodyTechnicians} isGuest={isGuest} />;
}
