"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Car {
  roNumber: number;
  owner: string;
  vehicle: string;
  bodyTechnician: string;
  estimator?: string;
  status: "NOT_STARTED" | "UNDERWAY" | "COMPLETED";
  priority: number;
}

export default function PaintQueueCard({ car }: { car: Car }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: car.roNumber });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex-1 bg-white border-2 rounded-lg p-4 transition-all ${
        isDragging
          ? "border-blue-500 shadow-lg opacity-50"
          : "border-gray-200 hover:shadow-md"
      }`}
      suppressHydrationWarning
    >
      {/* Main Info */}
      <div className="flex items-start justify-between gap-3">
        {isMounted && (
          <div
            {...attributes}
            {...listeners}
            className="p-1 cursor-grab active:cursor-grabbing touch-none"
            title="Drag to change status"
          >
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Link href={`/car-view/${car.roNumber}`} className="hover:opacity-75 transition">
            <p className="font-bold text-lg text-blue-600 hover:underline">RO {car.roNumber}</p>
          </Link>
          <p className="text-sm font-semibold text-gray-700">{car.vehicle}</p>
          <p className="text-xs text-gray-600">{car.owner}</p>
          <p className="text-xs text-gray-500 mt-1">
            Tech: {car.bodyTechnician} | Estimator: {car.estimator}
          </p>
        </div>
      </div>
    </div>
  );
}
