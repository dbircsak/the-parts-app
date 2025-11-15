import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function EditMaterialsPage() {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/");
  }

  const materials = await prisma.material.findMany({
    orderBy: { category: "asc" },
  });

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Materials</h1>

      <div className="flex gap-4 mb-6">
        <a
          href="/admin/edit-materials/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
        >
          Add Material
        </a>
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
                  Unit
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Reorder
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">{material.name}</td>
                  <td className="px-4 py-2 text-sm">{material.category}</td>
                  <td className="px-4 py-2 text-sm">{material.quantity}</td>
                  <td className="px-4 py-2 text-sm">{material.unit}</td>
                  <td className="px-4 py-2 text-sm">
                    {material.reorderLevel}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <a
                      href={`/admin/edit-materials/${material.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Edit
                    </a>
                  </td>
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
