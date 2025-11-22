import React from "react";

interface FilterButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
}

export default function FilterButton({
  active = false,
  children,
  className = "",
  ...props
}: FilterButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
