"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, ChevronUp, ChevronDown } from "lucide-react";

export const dynamic = "force-dynamic";
import Link from "next/link";
import VehicleStatusFilter from "@/components/VehicleStatusFilter";
import { VehicleStatus } from "@/lib/vehicle-status-filter";
import FilterButton from "@/components/FilterButton";
import Input from "@/components/Input";
import Alert from "@/components/Alert";

type GroupMode = "estimator" | "technician";

interface SortState {
    dueDate?: "asc" | "desc";
    partsPercent?: "asc" | "desc";
}

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
    const [sortState, setSortState] = useState<SortState>({});
    const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

    // Fetch and process data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/production-schedule?groupBy=${groupMode}`);
                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || "Failed to fetch production schedule");
                }
                
                setGroupedData(result.data);
                // Reset selected group when switching modes
                setSelectedGroup(result.data.length > 0 ? result.data[0].name : null);
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

                // Vehicle status filter
                if (vehicleStatusFilter === "all") return true;
                const now = new Date();
                const scheduledOut = car.scheduledOut ? new Date(car.scheduledOut) : null;

                if (vehicleStatusFilter === "in-shop") {
                    return scheduledOut !== null && scheduledOut < now;
                }
                if (vehicleStatusFilter === "pre-order") {
                    return scheduledOut === null || scheduledOut >= now;
                }

                return true;
            }),
        }));

        // Remove empty groups
        filtered = filtered.filter((group) => group.cars.length > 0);

        // Sort cars within each group
        filtered.forEach((group) => {
            group.cars.sort((a, b) => {
                let comparison = 0;

                // Primary sort: dueDate (highest priority if enabled)
                if (sortState.dueDate) {
                    const dateA = a.scheduledOut ? new Date(a.scheduledOut).getTime() : Infinity;
                    const dateB = b.scheduledOut ? new Date(b.scheduledOut).getTime() : Infinity;
                    if (dateA !== dateB) {
                        comparison = dateA - dateB;
                        if (sortState.dueDate === "desc") comparison = -comparison;
                    }
                }

                // Secondary sort: partsPercent (only if dueDate is tied, or if dueDate isn't enabled)
                if (comparison === 0 && sortState.partsPercent) {
                    comparison = a.partsReceivedPct - b.partsReceivedPct;
                    if (sortState.partsPercent === "desc") comparison = -comparison;
                }

                return comparison;
            });
        });

        return filtered;
        }, [groupedData, searchTerm, vehicleStatusFilter, sortState]);

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
                    <FilterButton
                        active={groupMode === "estimator"}
                        onClick={() => setGroupMode("estimator")}
                    >
                        Group by Estimators
                    </FilterButton>
                    <FilterButton
                        active={groupMode === "technician"}
                        onClick={() => setGroupMode("technician")}
                    >
                        Group by Technicians
                    </FilterButton>

                    {/* Vehicle Status Filter - Hidden when grouping by technicians */}
                    {groupMode === "estimator" && (
                        <VehicleStatusFilter
                            value={vehicleStatusFilter}
                            onChange={setVehicleStatusFilter}
                        />
                    )}

                    <div className="flex gap-2 ml-auto">
                        {/* Due Date Button - Sort by Scheduled Out Date */}
                        <FilterButton
                            active={!!sortState.dueDate}
                            onClick={() => {
                                setSortState((prev) => {
                                    const newState = { ...prev };
                                    if (newState.dueDate === "asc") {
                                        newState.dueDate = "desc";
                                    } else if (newState.dueDate === "desc") {
                                        delete newState.dueDate;
                                    } else {
                                        newState.dueDate = "asc";
                                    }
                                    return newState;
                                });
                            }}
                            className="flex items-center gap-1 px-3 py-2 text-sm"
                        >
                            Due Date
                            {sortState.dueDate && (
                                sortState.dueDate === "desc" ? (
                                    <ChevronDown className="w-4 h-4" />
                                ) : (
                                    <ChevronUp className="w-4 h-4" />
                                )
                            )}
                        </FilterButton>

                        {/* Parts % Button - Sort by Parts Completion % */}
                        <FilterButton
                            active={!!sortState.partsPercent}
                            onClick={() => {
                                setSortState((prev) => {
                                    const newState = { ...prev };
                                    if (newState.partsPercent === "asc") {
                                        newState.partsPercent = "desc";
                                    } else if (newState.partsPercent === "desc") {
                                        delete newState.partsPercent;
                                    } else {
                                        newState.partsPercent = "asc";
                                    }
                                    return newState;
                                });
                            }}
                            className="flex items-center gap-1 px-3 py-2 text-sm"
                        >
                            Parts %
                            {sortState.partsPercent && (
                                sortState.partsPercent === "desc" ? (
                                    <ChevronDown className="w-4 h-4" />
                                ) : (
                                    <ChevronUp className="w-4 h-4" />
                                )
                            )}
                        </FilterButton>
                    </div>
                </div>

                {/* Search Bar */}
                <Input
                    type="text"
                    placeholder="Search by owner, vehicle, RO, technician, estimator, or color..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search className="w-4 h-4" />}
                />
            </div>

            {/* Sidebar Layout */}
            {filteredAndSortedData.length === 0 ? (
                <Alert type="info">
                    No cars found matching your filters.
                </Alert>
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
                                    className={`w-full text-left rounded-lg p-3 border transition ${selectedGroup === group.name
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
                                            <Alert type="success" className="text-center">
                                                All Parts In
                                            </Alert>
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
