import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function MaterialsPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const isAdmin = (session.user as any)?.role === "ADMIN";
  const materials = await prisma.material.findMany({
    orderBy: { category: "asc" },
  });

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Materials</h1>
        {isAdmin && (
          <a
            href="/admin/edit-materials/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
          >
            Add Material
          </a>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Category
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Quantity
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Reorder Level
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Supplier
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm font-medium">
                    {material.name}
                  </td>
                  <td className="px-4 py-2 text-sm">{material.category}</td>
                  <td className="px-4 py-2 text-sm">
                    {material.quantity} {material.unit}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {material.reorderLevel}{" "}
                    <span className="text-red-600 font-medium">
                      {material.quantity <= material.reorderLevel ? "!" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">{material.supplier}</td>
                  <td className="px-4 py-2 text-sm">${material.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {materials.length === 0 && (
        <p className="text-gray-500">No materials found.</p>
      )}
    </div>
  );
}
