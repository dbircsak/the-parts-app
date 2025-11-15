import type { Metadata } from "next";
import { auth } from "@/auth";
import Navbar from "@/components/navbar";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "The Parts App",
  description: "Parts and repair order workflow management",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <div className="flex flex-col min-h-screen">
          {session && <Navbar role={(session.user as any)?.role} />}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
