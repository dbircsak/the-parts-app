import React from "react";

type StatusColor = "red" | "yellow" | "green" | "blue" | "gray";

interface StatusDotProps {
  color?: StatusColor;
  title?: string;
  className?: string;
}

const colorStyles: Record<StatusColor, string> = {
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  gray: "bg-gray-500",
};

export default function StatusDot({
  color = "gray",
  title,
  className = "",
}: StatusDotProps) {
  return (
    <div
      className={`w-3 h-3 rounded-full ${colorStyles[color]} ${className}`}
      title={title}
    />
  );
}
