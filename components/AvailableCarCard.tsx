"use client";

interface AvailableCar {
  roNumber: number;
  owner: string;
  vehicle: string;
  bodyTechnician: string;
  estimator: string;
}

export default function AvailableCarCard({ car }: { car: AvailableCar }) {
  return (
    <div className="flex-1 bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-lg text-gray-900">RO {car.roNumber}</p>
        <p className="text-sm font-semibold text-gray-700">{car.vehicle}</p>
        <p className="text-xs text-gray-600">{car.owner}</p>
        <p className="text-xs text-gray-500 mt-1">
          Estimator: {car.estimator}
        </p>
      </div>
    </div>
  );
}
