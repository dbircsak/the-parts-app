"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import PartNumberLink from "@/components/PartNumberLink";
import VehicleStatusFilter from "@/components/VehicleStatusFilter";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Badge from "@/components/Badge";
import Table from "@/components/Table";
import { VehicleStatus } from "@/lib/vehicle-status-filter";

type GroupMode = "car" | "vendor";

interface PartData {
    partDescription: string;
    partNumber: string;
    receivedQty: number;
    invoiceDate: string | null;
}



interface GroupedData {
    carView: {
        cars: {
            roNumber: number;
            owner: string;
            vehicle: string;
            bodyTechnician: string;
            estimator: string;
            vehicleIn: string;
            currentPhase: string;
            vendors: {
                vendorName: string;
                parts: PartData[];
            }[];
        }[];
    };
    vendorView: {
        vendors: {
            vendorName: string;
            cars: {
                roNumber: number;
                owner: string;
                vehicle: string;
                bodyTechnician: string;
                estimator: string;
                vehicleIn: string;
                currentPhase: string;
                parts: PartData[];
            }[];
        }[];
    };
}

export default function DeliveriesPage() {
    const [groupMode, setGroupMode] = useState<GroupMode>("car");
    const [data, setData] = useState<GroupedData | null>(null);
    const [loading, setLoading] = useState(true);
    const [vehicleStatusFilter, setVehicleStatusFilter] = useState<VehicleStatus>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedCars, setExpandedCars] = useState<Set<number>>(new Set());
    const [expandedVendorsInCar, setExpandedVendorsInCar] = useState<Set<string>>(
        new Set()
    );
    const [expandedVendors, setExpandedVendors] = useState<Set<string>>(new Set());
    const [expandedCarsInVendor, setExpandedCarsInVendor] = useState<Set<number>>(
        new Set()
    );

    useEffect(() => {
        const fetchDeliveries = async () => {
            try {
                const response = await fetch(`/api/deliveries?groupBy=${groupMode}`);
                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || "Failed to fetch deliveries");
                }
                
                // Format response to match expected structure
                const formattedData: GroupedData = {
                    carView: { cars: [] },
                    vendorView: { vendors: [] },
                };
                
                if (groupMode === "car") {
                    formattedData.carView.cars = result.cars || [];
                } else {
                    formattedData.vendorView.vendors = result.vendors || [];
                }
                
                setData(formattedData);
            } catch (error) {
                console.error("Failed to fetch deliveries:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDeliveries();
    }, [groupMode]);

    if (loading) {
        return (
            <div className="p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-6">Deliveries</h1>
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-6">Deliveries</h1>
                <p className="text-gray-500">Failed to load deliveries.</p>
            </div>
        );
    }

    const toggleCar = (roNumber: number) => {
        const newExpanded = new Set(expandedCars);
        if (newExpanded.has(roNumber)) {
            newExpanded.delete(roNumber);
        } else {
            newExpanded.add(roNumber);
        }
        setExpandedCars(newExpanded);
    };

    const toggleVendorInCar = (vendorName: string) => {
        const newExpanded = new Set(expandedVendorsInCar);
        if (newExpanded.has(vendorName)) {
            newExpanded.delete(vendorName);
        } else {
            newExpanded.add(vendorName);
        }
        setExpandedVendorsInCar(newExpanded);
    };

    const toggleVendor = (vendorName: string) => {
        const newExpanded = new Set(expandedVendors);
        if (newExpanded.has(vendorName)) {
            newExpanded.delete(vendorName);
        } else {
            newExpanded.add(vendorName);
        }
        setExpandedVendors(newExpanded);
    };

    const toggleCarInVendor = (roNumber: number) => {
        const newExpanded = new Set(expandedCarsInVendor);
        if (newExpanded.has(roNumber)) {
            newExpanded.delete(roNumber);
        } else {
            newExpanded.add(roNumber);
        }
        setExpandedCarsInVendor(newExpanded);
    };

    const expandAll = () => {
        if (groupMode === "car") {
            const allCars = new Set(data.carView.cars.map((c) => c.roNumber));
            setExpandedCars(allCars);
            const allVendors = new Set<string>();
            data.carView.cars.forEach((car) => {
                car.vendors.forEach((vendor) => {
                    allVendors.add(vendor.vendorName);
                });
            });
            setExpandedVendorsInCar(allVendors);
        } else {
            const allVendors = new Set(data.vendorView.vendors.map((v) => v.vendorName));
            setExpandedVendors(allVendors);
            const allCars = new Set<number>();
            data.vendorView.vendors.forEach((vendor) => {
                vendor.cars.forEach((car) => {
                    allCars.add(car.roNumber);
                });
            });
            setExpandedCarsInVendor(allCars);
        }
    };

    const collapseAll = () => {
        setExpandedCars(new Set());
        setExpandedVendorsInCar(new Set());
        setExpandedVendors(new Set());
        setExpandedCarsInVendor(new Set());
    };

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Deliveries</h1>

            {/* View Mode Filter */}
            <div className="mb-6 flex flex-col gap-3">
                <div className="flex gap-2 flex-wrap items-center">
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setGroupMode("car")}
                            variant={groupMode === "car" ? "primary" : "secondary"}
                        >
                            Group by Car
                        </Button>
                        <Button
                            onClick={() => setGroupMode("vendor")}
                            variant={groupMode === "vendor" ? "primary" : "secondary"}
                        >
                            Group by Vendor
                        </Button>
                    </div>

                    <VehicleStatusFilter
                        value={vehicleStatusFilter}
                        onChange={setVehicleStatusFilter}
                    />

                    <div className="flex gap-2 ml-auto">
                        <Button
                            onClick={expandAll}
                            variant="success"
                            size="sm"
                        >
                            Expand All
                        </Button>
                        <Button
                            onClick={collapseAll}
                            variant="warning"
                            size="sm"
                        >
                            Collapse All
                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                <Input
                    type="text"
                    placeholder="Search by owner, vehicle, RO, technician, estimator, or vendor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search className="w-4 h-4" />}
                />
            </div>

            {/* Car View */}
            {groupMode === "car" && (
                <div className="space-y-4">
                    {(() => {
                        const now = new Date();
                        const searchLower = searchTerm.toLowerCase();
                        const filteredCars = data.carView.cars.filter((car) => {
                            // Search filter
                            const matchesSearch =
                                car.owner.toLowerCase().includes(searchLower) ||
                                car.vehicle.toLowerCase().includes(searchLower) ||
                                car.roNumber.toString().includes(searchLower) ||
                                car.bodyTechnician.toLowerCase().includes(searchLower) ||
                                car.estimator.toLowerCase().includes(searchLower) ||
                                car.vendors.some((v) => v.vendorName.toLowerCase().includes(searchLower));

                            if (!matchesSearch) return false;

                            // Vehicle status filter
                             if (vehicleStatusFilter === "all") return true;
                             const vehicleIn = car.vehicleIn ? new Date(car.vehicleIn) : null;
                             const isNotScheduled = car.currentPhase !== "[Scheduled]";

                             if (vehicleStatusFilter === "in-shop") {
                                 return vehicleIn !== null && vehicleIn < now && isNotScheduled;
                             }
                             if (vehicleStatusFilter === "pre-order") {
                                 return vehicleIn === null || vehicleIn >= now;
                             }
                             return true;
                        });

                        if (filteredCars.length === 0) {
                            return <p className="text-gray-500">No deliveries found.</p>;
                        }
                        return filteredCars.map((car) => {
                            const isCarExpanded = expandedCars.has(car.roNumber);
                            return (
                                <div key={car.roNumber} className="border rounded-lg bg-white">
                                    {/* Car Header */}
                                    <button
                                        onClick={() => toggleCar(car.roNumber)}
                                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 border-b"
                                    >
                                        {isCarExpanded ? (
                                            <ChevronDown className="w-5 h-5" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5" />
                                        )}
                                        <div className="text-left flex-1">
                                            <h3 className="font-bold text-lg">
                                                <Link
                                                    href={`/car-view/${car.roNumber}`}
                                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    RO {car.roNumber}
                                                </Link>
                                                {" "}• {car.owner} • {car.vehicle}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {car.bodyTechnician} • {car.estimator}
                                            </p>
                                        </div>
                                        <Badge color="blue">
                                            {car.vendors.length} vendor{car.vendors.length !== 1 ? "s" : ""}
                                        </Badge>
                                    </button>

                                    {/* Vendors under this car */}
                                    {isCarExpanded && (
                                        <div className="divide-y">
                                            {car.vendors.map((vendor) => {
                                                const isVendorExpanded = expandedVendorsInCar.has(
                                                    vendor.vendorName
                                                );
                                                return (
                                                    <div key={vendor.vendorName}>
                                                        {/* Vendor Header */}
                                                        <button
                                                            onClick={() => toggleVendorInCar(vendor.vendorName)}
                                                            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-gray-50 bg-gray-50"
                                                        >
                                                            {isVendorExpanded ? (
                                                                <ChevronDown className="w-4 h-4" />
                                                            ) : (
                                                                <ChevronRight className="w-4 h-4" />
                                                            )}
                                                            <div className="text-left flex-1">
                                                                <p className="font-semibold text-green-700">
                                                                    {vendor.vendorName}
                                                                </p>
                                                            </div>
                                                            <Badge color="green">
                                                                {vendor.parts.length} part
                                                                {vendor.parts.length !== 1 ? "s" : ""}
                                                            </Badge>
                                                        </button>

                                                        {/* Parts under this vendor */}
                                                        {isVendorExpanded && (
                                                            <Table className="bg-white">
                                                                <Table.Head>
                                                                    <Table.Row>
                                                                        <Table.Cell header>Part Number</Table.Cell>
                                                                        <Table.Cell header>Description</Table.Cell>
                                                                        <Table.Cell header className="text-center">Received Qty</Table.Cell>
                                                                        <Table.Cell header>Invoice Date</Table.Cell>
                                                                    </Table.Row>
                                                                </Table.Head>
                                                                <Table.Body>
                                                                    {vendor.parts.map((part, idx) => (
                                                                        <Table.Row key={idx}>
                                                                            <Table.Cell className="font-mono">
                                                                                <PartNumberLink partNumber={part.partNumber} />
                                                                            </Table.Cell>
                                                                            <Table.Cell>{part.partDescription}</Table.Cell>
                                                                            <Table.Cell className="text-center font-semibold">{part.receivedQty}</Table.Cell>
                                                                            <Table.Cell>
                                                                                {part.invoiceDate
                                                                                    ? new Date(
                                                                                        part.invoiceDate
                                                                                    ).toLocaleDateString()
                                                                                    : "-"}
                                                                            </Table.Cell>
                                                                        </Table.Row>
                                                                    ))}
                                                                </Table.Body>
                                                            </Table>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        });
                    })()}
                </div>
            )}

            {/* Vendor View */}
            {groupMode === "vendor" && (
                <div className="space-y-4">
                    {(() => {
                         const now = new Date();
                         const searchLower = searchTerm.toLowerCase();
                         const filteredVendors = data.vendorView.vendors
                             .map((vendor) => ({
                                 ...vendor,
                                 cars: vendor.cars.filter((car) => {
                                     const matchesSearch =
                                         car.owner.toLowerCase().includes(searchLower) ||
                                         car.vehicle.toLowerCase().includes(searchLower) ||
                                         car.roNumber.toString().includes(searchLower) ||
                                         car.bodyTechnician.toLowerCase().includes(searchLower) ||
                                         car.estimator.toLowerCase().includes(searchLower) ||
                                         vendor.vendorName.toLowerCase().includes(searchLower);

                                     if (!matchesSearch) return false;

                                     // Vehicle status filter
                                     if (vehicleStatusFilter === "all") return true;
                                     const vehicleIn = car.vehicleIn ? new Date(car.vehicleIn) : null;
                                     const isNotScheduled = car.currentPhase !== "[Scheduled]";

                                     if (vehicleStatusFilter === "in-shop") {
                                         return vehicleIn !== null && vehicleIn < now && isNotScheduled;
                                     }
                                     if (vehicleStatusFilter === "pre-order") {
                                         return vehicleIn === null || vehicleIn >= now;
                                     }
                                     return true;
                                 })
                             }))
                             .filter((vendor) => vendor.cars.length > 0);

                        if (filteredVendors.length === 0) {
                            return <p className="text-gray-500">No deliveries found.</p>;
                        }

                        return filteredVendors.map((vendor) => {
                            const isVendorExpanded = expandedVendors.has(vendor.vendorName);
                            return (
                                <div key={vendor.vendorName} className="border rounded-lg bg-white">
                                    {/* Vendor Header */}
                                    <button
                                        onClick={() => toggleVendor(vendor.vendorName)}
                                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 border-b"
                                    >
                                        {isVendorExpanded ? (
                                            <ChevronDown className="w-5 h-5" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5" />
                                        )}
                                        <div className="text-left flex-1">
                                            <h3 className="font-bold text-lg text-green-700">
                                                {vendor.vendorName}
                                            </h3>
                                        </div>
                                        <Badge color="blue">
                                            {vendor.cars.length} car{vendor.cars.length !== 1 ? "s" : ""}
                                        </Badge>
                                    </button>

                                    {/* Cars under this vendor */}
                                    {isVendorExpanded && (
                                        <div className="divide-y">
                                            {vendor.cars.map((car) => {
                                                const isCarExpanded = expandedCarsInVendor.has(
                                                    car.roNumber
                                                );
                                                return (
                                                    <div key={car.roNumber}>
                                                        {/* Car Header */}
                                                        <button
                                                            onClick={() => toggleCarInVendor(car.roNumber)}
                                                            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-gray-50 bg-gray-50"
                                                        >
                                                            {isCarExpanded ? (
                                                                <ChevronDown className="w-4 h-4" />
                                                            ) : (
                                                                <ChevronRight className="w-4 h-4" />
                                                            )}
                                                            <div className="text-left flex-1">
                                                                <p className="font-semibold">
                                                                    <Link
                                                                        href={`/car-view/${car.roNumber}`}
                                                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                                                    >
                                                                        RO {car.roNumber}
                                                                    </Link>
                                                                    {" "}• {car.owner} • {car.vehicle}
                                                                </p>
                                                                <p className="text-xs text-gray-600">
                                                                    {car.bodyTechnician} • {car.estimator}
                                                                </p>
                                                            </div>
                                                            <Badge color="blue">
                                                                {car.parts.length} part
                                                                {car.parts.length !== 1 ? "s" : ""}
                                                            </Badge>
                                                        </button>

                                                        {/* Parts under this car */}
                                                        {isCarExpanded && (
                                                            <Table className="bg-white">
                                                                <Table.Head>
                                                                    <Table.Row>
                                                                        <Table.Cell header>Part Number</Table.Cell>
                                                                        <Table.Cell header>Description</Table.Cell>
                                                                        <Table.Cell header className="text-center">Received Qty</Table.Cell>
                                                                        <Table.Cell header>Invoice Date</Table.Cell>
                                                                    </Table.Row>
                                                                </Table.Head>
                                                                <Table.Body>
                                                                    {car.parts.map((part, idx) => (
                                                                        <Table.Row key={idx}>
                                                                            <Table.Cell className="font-mono">
                                                                                <PartNumberLink partNumber={part.partNumber} />
                                                                            </Table.Cell>
                                                                            <Table.Cell>{part.partDescription}</Table.Cell>
                                                                            <Table.Cell className="text-center font-semibold">{part.receivedQty}</Table.Cell>
                                                                            <Table.Cell>
                                                                                {part.invoiceDate
                                                                                    ? new Date(
                                                                                        part.invoiceDate
                                                                                    ).toLocaleDateString()
                                                                                    : "-"}
                                                                            </Table.Cell>
                                                                        </Table.Row>
                                                                    ))}
                                                                </Table.Body>
                                                            </Table>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        });
                    })()}
                </div>
            )}
        </div>
    );
}
