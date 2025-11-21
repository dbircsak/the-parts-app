import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div>
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold">Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/upload-extracts"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Upload Extracts
              </Link>
              <Link
                href="/admin/edit-materials"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Edit Materials
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
