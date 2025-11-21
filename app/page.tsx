import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold">The Parts App</h1>
      <p className="mt-4 text-gray-600">
        Welcome to the parts and repair order workflow management system.
      </p>
      {!session && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            You are in guest mode. <a href="/login" className="font-semibold underline">Login</a> to access additional features and edit data.
          </p>
        </div>
      )}
    </div>
  );
}
