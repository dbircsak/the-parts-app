import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PartsSearchClient from "@/components/parts-search-client";

export default async function PartsSearchPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Parts Search</h1>
      <PartsSearchClient />
    </div>
  );
}
