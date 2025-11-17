import { prisma } from "@/lib/prisma";
import MaterialsClient from "./MaterialsClient";

export default async function MaterialsPage() {
  const materials = await prisma.material.findMany({
    orderBy: { orderedDate: "desc" },
  });

  return <MaterialsClient initialMaterials={materials} />;
}
