import React from "react";

type BadgeColor = "blue" | "green" | "red" | "yellow" | "gray";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

const colorStyles: Record<BadgeColor, string> = {
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  red: "bg-red-100 text-red-800",
  yellow: "bg-yellow-100 text-yellow-800",
  gray: "bg-gray-100 text-gray-800",
};

export default function Badge({
  children,
  color = "blue",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`text-xs font-semibold px-2 py-1 rounded ${colorStyles[color]} ${className}`}
    >
      {children}
    </span>
  );
}
