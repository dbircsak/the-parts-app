import type { Metadata } from "next";
import { auth } from "@/auth";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Providers } from "@/components/providers";
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
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar role={session ? (session.user as any)?.role : null} isGuest={!session} />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
