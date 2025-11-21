"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavbarProps {
  role?: string;
}

export default function Navbar({ role = "TECHNICIAN" }: NavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = role === "ADMIN";

  const isActive = (path: string) => pathname === path;

  const menuItems = [
    { href: "/production-schedule", label: "Production Schedule" },
    { href: "/deliveries", label: "Deliveries" },
    { href: "/parts-search", label: "Parts Search" },
    { href: "/materials", label: "Materials" },
    { href: "/paint-list", label: "Paint List" },
    { href: "/unordered-parts", label: "Unordered Parts" },
    { href: "/vendors", label: "Vendors" },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            The Parts App
          </Link>

          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="hidden md:flex items-center space-x-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(item.href)
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {isAdmin && (
              <div className="relative group">
                <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Admin
                </button>
                <div className="hidden group-hover:block absolute right-0 mt-0 w-48 bg-white shadow-lg rounded-md z-10">
                  <Link
                    href="/admin/users"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left border-b"
                  >
                    Manage Users
                  </Link>
                  <Link
                    href="/admin/upload-extracts"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left border-b"
                  >
                    Upload Extracts
                  </Link>
                  <Link
                    href="/admin/debug"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Debug RO
                  </Link>
                </div>
              </div>
            )}

            <button
              onClick={() => signOut()}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                {item.label}
              </Link>
            ))}

            {isAdmin && (
              <>
                <Link
                  href="/admin/users"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Admin - Manage Users
                </Link>
                <Link
                  href="/admin/upload-extracts"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Admin - Upload Extracts
                </Link>
                <Link
                  href="/admin/debug"
                  className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Admin - Debug RO
                </Link>
              </>
            )}

            <button
              onClick={() => signOut()}
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
