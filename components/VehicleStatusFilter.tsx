import { VehicleStatus } from "@/lib/vehicle-status-filter";

export default function VehicleStatusFilter({
  value,
  onChange,
}: {
  value: VehicleStatus;
  onChange: (status: VehicleStatus) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {(["all", "in-shop", "pre-order"] as const).map((status) => (
        <button
          key={status}
          onClick={() => onChange(status)}
          className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
            value === status
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          {status === "all"
            ? "All Cars"
            : status === "in-shop"
            ? "In Shop"
            : "Pre-Order"}
        </button>
      ))}
    </div>
  );
}
