import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Card from "@/components/Card";
import Button from "@/components/Button";

export default async function AdminPage() {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Upload Extracts</h2>
          <p className="text-gray-600 text-sm mb-4">
            Import daily CSV extracts from Vista DMS.
          </p>
          <Link href="/admin/upload-extracts">
            <Button variant="primary">
              Go to Upload
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
