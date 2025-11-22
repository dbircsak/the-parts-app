import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ExpandableCardProps {
  header: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export default function ExpandableCard({
  header,
  children,
  defaultOpen = false,
  className = "",
}: ExpandableCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border rounded-lg bg-white ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 border-b text-left"
      >
        {isOpen ? (
          <ChevronDown className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
        <div className="flex-1">{header}</div>
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
}
