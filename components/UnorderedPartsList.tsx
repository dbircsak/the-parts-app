"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import PartNumberLink from "./PartNumberLink";
import VehicleStatusFilter from "./VehicleStatusFilter";
import Button from "./Button";
import Input from "./Input";
import Badge from "./Badge";
import Table from "./Table";
import { VehicleStatus } from "@/lib/vehicle-status-filter";

interface EnrichedPart {
    id: number;
    roNumber: number;
    line: number;
    partNumber: string;
    partDescription: string;
    partType: string;
    vendorName: string;
    roQty: number;
    orderedQty: number;
    orderedDate: string | null;
    expectedDelivery: string | null;
    receivedQty: number;
    invoiceDate: string | null;
    returnedQty: number;
    dailyOut: {
        roNumber: number;
        owner: string;
        vehicle: string;
        vehicleColor: string;
        licensePlateNumber: string;
        partsReceivedPct: number;
        vehicleIn: string;
        currentPhase: string;
        scheduledOut: string | null;
        bodyTechnician: string;
        estimator: string;
        createdAt: string;
        updatedAt: string;
    };
}

export default function UnorderedPartsList({
    parts,
}: {
    parts: EnrichedPart[];
}) {
    const [searchFilter, setSearchFilter] = useState("");
    const [vehicleStatusFilter, setVehicleStatusFilter] = useState<VehicleStatus>("all");
    const [expandedEstimators, setExpandedEstimators] = useState<Set<string>>(
        new Set()
    );
    const [expandedCars, setExpandedCars] = useState<Set<string>>(new Set());

    const filteredAndGroupedParts = useMemo(() => {
        // Apply text filter
        let filtered = parts;
        if (searchFilter.trim()) {
            const lowerFilter = searchFilter.toLowerCase();
            filtered = parts.filter(
                (part) =>
                    part.roNumber.toString().includes(lowerFilter) ||
                    part.partNumber.toLowerCase().includes(lowerFilter) ||
                    part.partDescription.toLowerCase().includes(lowerFilter) ||
                    part.dailyOut.owner.toLowerCase().includes(lowerFilter) ||
                    part.dailyOut.vehicle.toLowerCase().includes(lowerFilter)
            );
        }

        // Apply vehicle status filter
        if (vehicleStatusFilter !== "all") {
            const now = new Date();
            filtered = filtered.filter((part) => {
                const vehicleIn = new Date(part.dailyOut.vehicleIn);
                const isInPast = vehicleIn < now;
                const isNotScheduled = part.dailyOut.currentPhase !== "[Scheduled]";

                switch (vehicleStatusFilter) {
                    case "in-shop":
                        return isInPast && isNotScheduled;
                    case "pre-order":
                        return !isInPast;
                    default:
                        return true;
                }
            });
        }

        // Group by estimator, then by car (RO)
        const grouped = filtered.reduce(
            (acc, part) => {
                const estimator = part.dailyOut.estimator;
                const roNumber = part.roNumber;
                const carKey = `${roNumber}`;

                if (!acc[estimator]) {
                    acc[estimator] = {};
                }
                if (!acc[estimator][carKey]) {
                    acc[estimator][carKey] = {
                        roNumber,
                        owner: part.dailyOut.owner,
                        vehicle: part.dailyOut.vehicle,
                        parts: [],
                    };
                }
                acc[estimator][carKey].parts.push(part);
                return acc;
            },
            {} as Record<
                string,
                Record<
                    string,
                    {
                        roNumber: number;
                        owner: string;
                        vehicle: string;
                        parts: EnrichedPart[];
                    }
                >
            >
        );

        return grouped;
    }, [parts, searchFilter, vehicleStatusFilter]);

    const toggleEstimator = (estimator: string) => {
        const newExpanded = new Set(expandedEstimators);
        if (newExpanded.has(estimator)) {
            newExpanded.delete(estimator);
        } else {
            newExpanded.add(estimator);
        }
        setExpandedEstimators(newExpanded);
    };

    const toggleCar = (carKey: string) => {
        const newExpanded = new Set(expandedCars);
        if (newExpanded.has(carKey)) {
            newExpanded.delete(carKey);
        } else {
            newExpanded.add(carKey);
        }
        setExpandedCars(newExpanded);
    };

    const expandAll = () => {
        const allEstimators = new Set(estimators);
        const allCars = new Set<string>();
        Object.values(filteredAndGroupedParts).forEach((estimatorCars) => {
            Object.keys(estimatorCars).forEach((carKey) => {
                allCars.add(carKey);
            });
        });
        setExpandedEstimators(allEstimators);
        setExpandedCars(allCars);
    };

    const collapseAll = () => {
        setExpandedEstimators(new Set());
        setExpandedCars(new Set());
    };

    const totalParts = Object.values(filteredAndGroupedParts).reduce(
        (sum, estimatorCars) =>
            sum +
            Object.values(estimatorCars).reduce(
                (carSum, car) =>
                    carSum +
                    car.parts.filter((part) => part.partNumber.trim()).length,
                0
            ),
        0
    );

    const estimators = Object.keys(filteredAndGroupedParts).sort();

    return (
        <>
            <div className="mb-6 flex flex-col gap-3">
                <Input
                    type="text"
                    placeholder="Search by RO, part number, description, vehicle, or owner..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                />

                <div className="flex gap-2 flex-wrap items-center">
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

                <p className="text-sm text-gray-600">
                    {totalParts === 0
                        ? "All parts are ordered."
                        : `${totalParts} unordered part${totalParts !== 1 ? "s" : ""} across ${estimators.length} estimator${estimators.length !== 1 ? "s" : ""}`}
                </p>
            </div>

            {estimators.length === 0 ? (
                <p className="text-gray-500">No unordered parts found.</p>
            ) : (
                <div className="space-y-4">
                    {estimators.map((estimator) => {
                        const estimatorCars = filteredAndGroupedParts[estimator];
                        const carKeys = Object.keys(estimatorCars).sort();
                        const isEstimatorExpanded = expandedEstimators.has(estimator);

                        return (
                            <div key={estimator} className="border rounded-lg bg-white">
                                {/* Estimator Header */}
                                <button
                                    onClick={() => toggleEstimator(estimator)}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 border-b"
                                >
                                    {isEstimatorExpanded ? (
                                        <ChevronDown className="w-5 h-5" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5" />
                                    )}
                                    <div className="text-left flex-1">
                                        <h3 className="font-bold text-lg">{estimator}</h3>
                                        {(() => {
                                            const filteredCarKeys = carKeys.filter(
                                                (carKey) =>
                                                    estimatorCars[carKey].parts.some((part) =>
                                                        part.partNumber.trim()
                                                    )
                                            );
                                            const totalParts = filteredCarKeys.reduce(
                                                (sum, key) =>
                                                    sum +
                                                    estimatorCars[key].parts.filter((part) =>
                                                        part.partNumber.trim()
                                                    ).length,
                                                0
                                            );
                                            return (
                                                <p className="text-sm text-gray-600">
                                                    {filteredCarKeys.length} car
                                                    {filteredCarKeys.length !== 1 ? "s" : ""} •{" "}
                                                    {totalParts} part{totalParts !== 1 ? "s" : ""}
                                                </p>
                                            );
                                        })()}
                                    </div>
                                </button>

                                {/* Cars under this estimator */}
                                {isEstimatorExpanded && (
                                    <div className="divide-y">
                                        {carKeys
                                            .filter(
                                                (carKey) =>
                                                    estimatorCars[carKey].parts.some((part) =>
                                                        part.partNumber.trim()
                                                    )
                                            )
                                            .map((carKey) => {
                                                const car = estimatorCars[carKey];
                                                const isCarExpanded = expandedCars.has(carKey);

                                                return (
                                                    <div key={carKey}>
                                                        {/* Car Header */}
                                                        <button
                                                            onClick={() => toggleCar(carKey)}
                                                            className="w-full px-6 py-3 flex items-center gap-3 hover:bg-gray-50 bg-gray-50"
                                                        >
                                                            {isCarExpanded ? (
                                                                <ChevronDown className="w-4 h-4" />
                                                            ) : (
                                                                <ChevronRight className="w-4 h-4" />
                                                            )}
                                                            <div className="text-left flex-1">
                                                                <p className="font-semibold">
                                                                    <Link href={`/car-view/${car.roNumber}`} className="text-blue-600 hover:underline">
                                                                        RO {car.roNumber}
                                                                    </Link>
                                                                    {" "} • {car.owner} • {car.vehicle}
                                                                </p>
                                                            </div>
                                                            <Badge color="blue">
                                                                {car.parts.filter((part) => part.partNumber.trim()).length} part
                                                                {car.parts.filter((part) => part.partNumber.trim()).length !== 1 ? "s" : ""}
                                                            </Badge>
                                                        </button>

                                                        {/* Parts under this car */}
                                                        {isCarExpanded && (
                                                            <Table className="bg-white">
                                                                <Table.Head>
                                                                    <Table.Row>
                                                                        <Table.Cell header>Part Number</Table.Cell>
                                                                        <Table.Cell header>Description</Table.Cell>
                                                                        <Table.Cell header>Line</Table.Cell>
                                                                        <Table.Cell header>Qty</Table.Cell>
                                                                        <Table.Cell header>Order Date</Table.Cell>
                                                                    </Table.Row>
                                                                </Table.Head>
                                                                <Table.Body>
                                                                    {car.parts
                                                                        .filter((part) => part.partNumber.trim())
                                                                        .map((part) => (
                                                                            <Table.Row key={part.id}>
                                                                                <Table.Cell className="font-mono">
                                                                                    <PartNumberLink partNumber={part.partNumber} />
                                                                                </Table.Cell>
                                                                                <Table.Cell>
                                                                                    {part.partDescription}
                                                                                </Table.Cell>
                                                                                <Table.Cell>{part.line}</Table.Cell>
                                                                                <Table.Cell className="font-semibold">
                                                                                    {part.roQty}
                                                                                </Table.Cell>
                                                                                <Table.Cell>
                                                                                    {part.orderedDate
                                                                                        ? new Date(part.orderedDate).toLocaleDateString()
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
                    })}
                </div>
            )}
        </>
    );
}
