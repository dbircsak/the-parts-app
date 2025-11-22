import React from "react";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  children: React.ReactNode;
  type?: AlertType;
  className?: string;
}

const typeStyles: Record<AlertType, string> = {
  success: "bg-green-100 border border-green-400 text-green-700",
  error: "bg-red-100 border border-red-400 text-red-700",
  warning: "bg-yellow-50 border border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border border-blue-200 text-blue-800",
};

export default function Alert({
  children,
  type = "info",
  className = "",
}: AlertProps) {
  return (
    <div
      className={`px-4 py-3 rounded-lg ${typeStyles[type]} ${className}`}
      role="alert"
    >
      {children}
    </div>
  );
}
