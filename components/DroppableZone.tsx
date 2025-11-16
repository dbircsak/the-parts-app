"use client";

import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

interface DroppableZoneProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export default function DroppableZone({
  id,
  children,
  className = "",
}: DroppableZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? "ring-2 ring-blue-400 bg-blue-50" : ""}`}
    >
      {children}
    </div>
  );
}
