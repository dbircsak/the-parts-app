"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";
import PartNumberLink from "./part-number-link";
import { getPartStatus, PART_STATUS_CONFIG } from "@/lib/part-status";
import PaginationControls from "./PaginationControls";
import Input from "./Input";
import Table from "./Table";

interface Part {
    id: number;
    roNumber: number;
    line: number;
    partNumber: string;
    partDescription: string;
    partType: string;
    vendorName: string;
    roQty: number;
    orderedQty: number;
    orderedDate: Date | null;
    expectedDelivery: Date | null;
    receivedQty: number;
    invoiceDate: Date | null;
    returnedQty: number;
    owner: string;
}

type SortField = keyof Part | "status";
type SortDirection = "asc" | "desc";

const getStatusSortValue = (part: Part): number => {
    const status = getPartStatus(part.roQty, part.orderedQty, part.receivedQty, part.returnedQty);
    const order: Record<string, number> = {
        not_ordered: 0,
        on_order: 1,
        received: 2,
        returned: 3,
    };
    return order[status.type] ?? 0;
};

export default function PartsSearchClient() {
    const [parts, setParts] = useState<Part[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchFilter, setSearchFilter] = useState("");
    const [sortField, setSortField] = useState<SortField>("roNumber");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Fetch parts data
    useEffect(() => {
        const fetchParts = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                if (searchFilter.trim()) params.append("q", searchFilter);
                params.append("page", currentPage.toString());
                params.append("status", selectedStatus);

                const response = await fetch(`/api/parts/search?${params}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch parts");
                }
                const result = await response.json();
                setParts(result.data || []);
                setTotalPages(result.pagination.totalPages);
            } catch (err) {
                console.error("Failed to fetch parts:", err);
                setError("Failed to load parts");
                setParts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchParts();
    }, [searchFilter, currentPage, selectedStatus]);

    const filteredAndSortedParts = useMemo(() => {
        // Apply sort (status filter is done server-side)
        return [...parts].sort((a, b) => {
            let comparison = 0;

            if (sortField === "status") {
                const aVal = getStatusSortValue(a);
                const bVal = getStatusSortValue(b);
                comparison = aVal - bVal;
            } else {
                const aVal = a[sortField as keyof Part];
                const bVal = b[sortField as keyof Part];

                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

                if (typeof aVal === "string") {
                    comparison = aVal.localeCompare(bVal as string);
                } else if (typeof aVal === "number") {
                    comparison = (aVal as number) - (bVal as number);
                } else {
                    comparison = aVal > bVal ? 1 : -1;
                }
            }

            return sortDirection === "asc" ? comparison : -comparison;
        });
    }, [parts, sortField, sortDirection, selectedStatus]);

    const paginatedParts = filteredAndSortedParts;

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const statusOptions = [
        { value: "all", label: "All Statuses" },
        ...Object.values(PART_STATUS_CONFIG).map((config) => ({
            value: config.type,
            label: `${config.emoji} ${config.label}`,
            color: config.color,
        })),
    ];

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return null;
        return sortDirection === "asc" ? (
            <ChevronUp className="w-4 h-4 inline ml-1" />
        ) : (
            <ChevronDown className="w-4 h-4 inline ml-1" />
        );
    };

    const ColumnHeader = ({ field, label }: { field: SortField; label: string }) => (
        <th
            className="px-4 py-2 text-left text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => handleSort(field)}
        >
            {label}
            <SortIcon field={field} />
        </th>
    );

    return (
        <>
            <div className="mb-4 flex flex-col gap-3">
                <div className="flex gap-3">
                    <Input
                        type="text"
                        placeholder="Search by RO, owner, part number, description, or vendor..."
                        value={searchFilter}
                        onChange={(e) => {
                            setSearchFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="flex-1"
                    />
                    <select
                        value={selectedStatus}
                        onChange={(e) => {
                            setSelectedStatus(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {loading && <p className="text-sm text-gray-600">Loading...</p>}
                {error && <p className="text-sm text-red-600">{error}</p>}
                {!loading && !error && (
                    <p className="text-sm text-gray-600">
                        Showing {paginatedParts.length} parts (Page {currentPage} of {totalPages})
                    </p>
                )}
            </div>

            {filteredAndSortedParts.length === 0 && (
                <p className="text-gray-500">No parts found.</p>
            )}

            {filteredAndSortedParts.length > 0 && (
                <div>
                    <Table>
                        <Table.Head>
                            <Table.Row>
                                <th
                                    className="px-4 py-2 text-left text-sm font-medium w-12 cursor-pointer hover:bg-gray-200 transition-colors"
                                    onClick={() => handleSort("status")}
                                    title="Part Status"
                                >
                                    Status
                                    {sortField === "status" && (
                                        sortDirection === "asc" ? (
                                            <ChevronUp className="w-4 h-4 inline ml-1" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 inline ml-1" />
                                        )
                                    )}
                                </th>
                                <ColumnHeader field="roNumber" label="RO" />
                                <ColumnHeader field="owner" label="Owner" />
                                <ColumnHeader field="partNumber" label="Part Number" />
                                <ColumnHeader field="partDescription" label="Description" />
                                <ColumnHeader field="vendorName" label="Vendor" />
                                <ColumnHeader field="roQty" label="Qty" />
                                <ColumnHeader field="orderedQty" label="Ordered Qty" />
                                <ColumnHeader field="orderedDate" label="Ordered Date" />
                                <ColumnHeader field="expectedDelivery" label="Expected Delivery" />
                                <ColumnHeader field="receivedQty" label="Received Qty" />
                                <ColumnHeader field="invoiceDate" label="Invoice Date" />
                                <ColumnHeader field="returnedQty" label="Returned Qty" />
                            </Table.Row>
                        </Table.Head>
                        <Table.Body>
                            {paginatedParts.map((part) => {
                                const status = getPartStatus(part.roQty, part.orderedQty, part.receivedQty, part.returnedQty);
                                return (
                                    <Table.Row key={part.id}>
                                        <Table.Cell className="flex items-center gap-2">
                                            <div
                                                className={`w-3 h-3 rounded-full ${status.color}`}
                                                title={status.label}
                                            />
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Link
                                                href={`/car-view/${part.roNumber}`}
                                                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                            >
                                                {part.roNumber}
                                            </Link>
                                        </Table.Cell>
                                        <Table.Cell>{part.owner}</Table.Cell>
                                        <Table.Cell className="font-mono">
                                            <PartNumberLink partNumber={part.partNumber} />
                                        </Table.Cell>
                                        <Table.Cell>{part.partDescription}</Table.Cell>
                                        <Table.Cell>{part.vendorName}</Table.Cell>
                                        <Table.Cell>{part.roQty}</Table.Cell>
                                        <Table.Cell>{part.orderedQty}</Table.Cell>
                                        <Table.Cell>
                                            {part.orderedDate ? new Date(part.orderedDate).toLocaleDateString() : "-"}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {part.expectedDelivery ? new Date(part.expectedDelivery).toLocaleDateString() : "-"}
                                        </Table.Cell>
                                        <Table.Cell>{part.receivedQty}</Table.Cell>
                                        <Table.Cell>
                                            {part.invoiceDate ? new Date(part.invoiceDate).toLocaleDateString() : "-"}
                                        </Table.Cell>
                                        <Table.Cell>{part.returnedQty}</Table.Cell>
                                    </Table.Row>
                                );
                            })}
                        </Table.Body>
                    </Table>
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </>
    );
}
