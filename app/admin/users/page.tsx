import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserManagement from "@/components/UserManagement";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <UserManagement />
    </div>
  );
}
