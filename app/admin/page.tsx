import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Upload Extracts</h2>
          <p className="text-gray-600 text-sm mb-4">
            Import daily CSV extracts from Vista DMS.
          </p>
          <Link
            href="/admin/upload-extracts"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
          >
            Go to Upload
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Edit Materials</h2>
          <p className="text-gray-600 text-sm mb-4">
            Manage consumable materials and paint inventory.
          </p>
          <Link
            href="/admin/edit-materials"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
          >
            Go to Materials
          </Link>
        </div>
      </div>
    </div>
  );
}
