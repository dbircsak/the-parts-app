import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold">The Parts App</h1>
      <p className="mt-4 text-gray-600">
        Welcome to the parts and repair order workflow management system.
      </p>
    </div>
  );
}
