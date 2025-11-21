"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";
import VehicleStatusFilter from "@/components/VehicleStatusFilter";
import { VehicleStatus } from "@/lib/vehicle-status-filter";

type GroupMode = "estimator" | "technician";
type SortMode = "dueDate" | "partsPercent" | "none";

interface CarData {
  roNumber: number;
  owner: string;
  vehicle: string;
  vehicleColor: string;
  bodyTechnician: string;
  estimator: string;
  scheduledOut: string | null;
  partsReceivedPct: number;
  not_ordered: number;
  on_order: number;
  received: number;
  returned: number;
}

interface GroupedData {
  name: string;
  cars: CarData[];
}

export default function ProductionSchedulePage() {
  const [groupMode, setGroupMode] = useState<GroupMode>("estimator");
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState<VehicleStatus>("all");
  const [sortMode, setSortMode] = useState<SortMode>("none");
  const [sortDescending, setSortDescending] = useState(false);
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Fetch and process data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/production-schedule");
        const data = await response.json();
        // Set the data based on current group mode
        const newData = groupMode === "estimator" ? data.estimator : data.technician;
        setGroupedData(newData);
        // Reset selected group when switching modes
        setSelectedGroup(newData.length > 0 ? newData[0].name : null);
      } catch (error) {
        console.error("Failed to fetch production schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupMode]);

  // Filter cars
  const filteredAndSortedData = useMemo(() => {
    let filtered = groupedData.map((group) => ({
      ...group,
      cars: group.cars.filter((car) => {
        // Search filter
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          car.owner.toLowerCase().includes(searchLower) ||
          car.vehicle.toLowerCase().includes(searchLower) ||
          car.roNumber.toString().includes(searchLower) ||
          car.bodyTechnician.toLowerCase().includes(searchLower) ||
          car.estimator.toLowerCase().includes(searchLower) ||
          car.vehicleColor.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;

        // Vehicle status filter (only in estimator view)
        if (groupMode === "estimator") {
          if (vehicleStatusFilter === "all") return true;
          const now = new Date();
          const scheduledOut = car.scheduledOut ? new Date(car.scheduledOut) : null;
          const isInPast = scheduledOut ? scheduledOut < now : false;

          if (vehicleStatusFilter === "in-shop") {
            return isInPast;
          }
          if (vehicleStatusFilter === "pre-order") {
            return !isInPast;
          }
        }

        return true;
      }),
    }));

    // Remove empty groups
    filtered = filtered.filter((group) => group.cars.length > 0);

    // Sort cars within each group
    filtered.forEach((group) => {
      if (sortMode === "dueDate") {
        group.cars.sort((a, b) => {
          const dateA = a.scheduledOut ? new Date(a.scheduledOut).getTime() : Infinity;
          const dateB = b.scheduledOut ? new Date(b.scheduledOut).getTime() : Infinity;
          const comparison = dateA - dateB;
          return sortDescending ? -comparison : comparison;
        });
      } else if (sortMode === "partsPercent") {
        const comparison = (a: typeof group.cars[0], b: typeof group.cars[0]) =>
          a.partsReceivedPct - b.partsReceivedPct;
        group.cars.sort((a, b) => (sortDescending ? comparison(a, b) : comparison(b, a)));
      }
    });

    return filtered;
  }, [groupedData, searchTerm, vehicleStatusFilter, sortMode, sortDescending, groupMode]);

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Production Schedule</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Production Schedule</h1>

      {/* Controls */}
      <div className="mb-6 space-y-3">
        {/* Group Mode Toggle */}
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => setGroupMode("estimator")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              groupMode === "estimator"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Group by Estimators
          </button>
          <button
            onClick={() => setGroupMode("technician")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              groupMode === "technician"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Group by Technicians
          </button>

          {/* Vehicle Status Filter */}
          <VehicleStatusFilter
            value={vehicleStatusFilter}
            onChange={setVehicleStatusFilter}
          />

          <div className="flex gap-2 ml-auto">
            {/* Due Date Button - Sort by Scheduled Out Date */}
            <button
              onClick={() => {
                if (sortMode === "dueDate") {
                  setSortDescending(!sortDescending);
                } else {
                  setSortMode("dueDate");
                  setSortDescending(false);
                }
              }}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition flex items-center gap-1 ${
                sortMode === "dueDate"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Due Date
              {sortMode === "dueDate" && (
                sortDescending ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )
              )}
            </button>

            {/* Parts % Button - Sort by Parts Completion % */}
            <button
              onClick={() => {
                if (sortMode === "partsPercent") {
                  setSortDescending(!sortDescending);
                } else {
                  setSortMode("partsPercent");
                  setSortDescending(false);
                }
              }}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition flex items-center gap-1 ${
                sortMode === "partsPercent"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Parts %
              {sortMode === "partsPercent" && (
                sortDescending ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by owner, vehicle, RO, technician, estimator, or color..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Sidebar Layout */}
      {filteredAndSortedData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No cars found matching your filters.</p>
        </div>
      ) : (
        <div className="flex gap-4">
          {/* Left Sidebar - Estimators/Technicians */}
          <div className="w-56 bg-gray-50 rounded-lg border border-gray-200 p-4 h-fit sticky top-8">
            <h3 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wide">
              {groupMode === "estimator" ? "Estimators" : "Technicians"}
            </h3>
            <div className="space-y-2">
              {filteredAndSortedData.map((group) => (
                <button
                  key={group.name}
                  onClick={() => setSelectedGroup(group.name)}
                  className={`w-full text-left rounded-lg p-3 border transition ${
                    selectedGroup === group.name
                      ? "bg-blue-500 border-blue-600 text-white"
                      : "bg-white border-gray-200 hover:border-blue-400 text-gray-800"
                  }`}
                >
                  <p className="font-semibold text-sm">{group.name}</p>
                  <p className={`text-xs ${selectedGroup === group.name ? "text-blue-100" : "text-gray-600"}`}>
                    {group.cars.length} car(s)
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Right Section - Cars Grid */}
          <div className="flex-1">
            <div className="space-y-3">
              {selectedGroup && filteredAndSortedData.find((g) => g.name === selectedGroup)?.cars.map((car) => (
                      <Link
                        key={car.roNumber}
                        href={`/car-view/${car.roNumber}`}
                        className="block"
                      >
                        <div className="bg-white border rounded-lg p-4 hover:shadow-lg hover:border-blue-400 transition cursor-pointer">
                          {/* Header with RO and Due Date */}
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-bold text-lg text-blue-600">RO {car.roNumber}</p>
                              <p className="text-xs text-gray-600">{car.owner}</p>
                            </div>
                            {car.scheduledOut && (
                              <p className="text-xs font-semibold text-gray-700 text-right">
                                {new Date(car.scheduledOut).toLocaleDateString()}
                              </p>
                            )}
                          </div>

                          {/* Vehicle Info */}
                          <div className="mb-3 space-y-1">
                            <p className="text-sm font-semibold text-gray-800">{car.vehicle}</p>
                            <p className="text-xs text-gray-600">{car.vehicleColor}</p>
                            <p className="text-xs text-gray-600">
                              {groupMode === "estimator" ? "Tech: " : "Est: "}
                              {groupMode === "estimator" ? car.bodyTechnician : car.estimator}
                            </p>
                          </div>

                          {/* Part Status Bar or All Parts In */}
                          {car.partsReceivedPct === 100 ? (
                            <div className="bg-green-100 border border-green-400 text-green-700 text-sm font-bold py-2 px-3 rounded text-center">
                              All Parts In
                            </div>
                          ) : (
                            <div className="mb-3">
                              <div className="flex h-6 rounded-lg overflow-hidden bg-gray-100 border border-gray-300">
                                {/* Not Ordered - Red */}
                                {car.not_ordered > 0 && (
                                  <div
                                    className="bg-red-500 flex items-center justify-center text-white text-xs font-bold"
                                    style={{
                                      width: `${(car.not_ordered / (car.not_ordered + car.on_order + car.received + car.returned)) * 100}%`,
                                    }}
                                    title={`Not Ordered: ${car.not_ordered}`}
                                  >
                                    {car.not_ordered > 0 && car.not_ordered <= 99 && (
                                      <span>{car.not_ordered}</span>
                                    )}
                                  </div>
                                )}

                                {/* On Order - Yellow */}
                                {car.on_order > 0 && (
                                  <div
                                    className="bg-yellow-400 flex items-center justify-center text-gray-800 text-xs font-bold"
                                    style={{
                                      width: `${(car.on_order / (car.not_ordered + car.on_order + car.received + car.returned)) * 100}%`,
                                    }}
                                    title={`On Order: ${car.on_order}`}
                                  >
                                    {car.on_order > 0 && car.on_order <= 99 && (
                                      <span>{car.on_order}</span>
                                    )}
                                  </div>
                                )}

                                {/* Received - Green */}
                                {car.received > 0 && (
                                  <div
                                    className="bg-green-500 flex items-center justify-center text-white text-xs font-bold"
                                    style={{
                                      width: `${(car.received / (car.not_ordered + car.on_order + car.received + car.returned)) * 100}%`,
                                    }}
                                    title={`Received: ${car.received}`}
                                  >
                                    {car.received > 0 && car.received <= 99 && (
                                      <span>{car.received}</span>
                                    )}
                                  </div>
                                )}

                                {/* Returned - Light Blue */}
                                {car.returned > 0 && (
                                  <div
                                    className="bg-blue-300 flex items-center justify-center text-gray-800 text-xs font-bold"
                                    style={{
                                      width: `${(car.returned / (car.not_ordered + car.on_order + car.received + car.returned)) * 100}%`,
                                    }}
                                    title={`Returned: ${car.returned}`}
                                  >
                                    {car.returned > 0 && car.returned <= 99 && (
                                      <span>{car.returned}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
