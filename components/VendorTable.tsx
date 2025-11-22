"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { usePagination } from "@/lib/usePagination";
import PaginationControls from "./PaginationControls";
import Input from "./Input";
import Table from "./Table";

interface Vendor {
    vendorName: string;
    primaryPhone: string | null;
    fax: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    preferred: boolean;
    electronic: boolean;
}

type SortField = keyof Vendor;
type SortDirection = "asc" | "desc";

export default function VendorTable({ vendors }: { vendors: Vendor[] }) {
    const [searchFilter, setSearchFilter] = useState("");
    const [sortField, setSortField] = useState<SortField>("vendorName");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    const filteredAndSortedVendors = useMemo(() => {
        let filtered = vendors;

        // Apply filter
        if (searchFilter.trim()) {
            const lowerFilter = searchFilter.toLowerCase();
            filtered = vendors.filter(
                (vendor) =>
                    vendor.vendorName.toLowerCase().includes(lowerFilter) ||
                    vendor.city?.toLowerCase().includes(lowerFilter) ||
                    vendor.state?.toLowerCase().includes(lowerFilter)
            );
        }

        // Apply sort
        return [...filtered].sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];

            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;

            let comparison = 0;
            if (typeof aVal === "string") {
                comparison = aVal.localeCompare(bVal as string);
            } else if (typeof aVal === "boolean") {
                comparison = (aVal as boolean) === (bVal as boolean) ? 0 : (aVal as boolean) ? 1 : -1;
            }

            return sortDirection === "asc" ? comparison : -comparison;
        });
    }, [vendors, searchFilter, sortField, sortDirection]);

    const {
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        paginatedItems: paginatedVendors,
        setCurrentPage,
        resetPage,
    } = usePagination(filteredAndSortedVendors);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
        resetPage();
    };

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
            className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => handleSort(field)}
        >
            {label}
            <SortIcon field={field} />
        </th>
    );

    return (
        <div>
            <div className="mb-4 flex flex-col gap-2">
                <Input
                    type="text"
                    placeholder="Filter vendors by name, city, or state..."
                    value={searchFilter}
                    onChange={(e) => {
                        setSearchFilter(e.target.value);
                        resetPage();
                    }}
                />
                <p className="text-sm text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedVendors.length)} of {filteredAndSortedVendors.length} vendors (Page {currentPage} of {totalPages})
                </p>
            </div>

            <Table>
                <Table.Head>
                    <Table.Row>
                        <ColumnHeader field="vendorName" label="Vendor Name" />
                        <ColumnHeader field="primaryPhone" label="Phone" />
                        <ColumnHeader field="fax" label="Fax" />
                        <ColumnHeader field="address" label="Address" />
                        <ColumnHeader field="city" label="City" />
                        <ColumnHeader field="state" label="State" />
                        <ColumnHeader field="zip" label="Zip" />
                        <ColumnHeader field="preferred" label="Preferred" />
                        <ColumnHeader field="electronic" label="Electronic" />
                    </Table.Row>
                </Table.Head>
                <Table.Body>
                    {paginatedVendors.map((vendor) => (
                        <Table.Row key={vendor.vendorName}>
                            <Table.Cell>{vendor.vendorName}</Table.Cell>
                            <Table.Cell>{vendor.primaryPhone || "-"}</Table.Cell>
                            <Table.Cell>{vendor.fax || "-"}</Table.Cell>
                            <Table.Cell>{vendor.address || "-"}</Table.Cell>
                            <Table.Cell>{vendor.city || "-"}</Table.Cell>
                            <Table.Cell>{vendor.state || "-"}</Table.Cell>
                            <Table.Cell>{vendor.zip || "-"}</Table.Cell>
                            <Table.Cell>{vendor.preferred ? "Yes" : "No"}</Table.Cell>
                            <Table.Cell>{vendor.electronic ? "Yes" : "No"}</Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {filteredAndSortedVendors.length === 0 && (
                <p className="text-gray-500 mt-4">No vendors found.</p>
            )}
        </div>
    );
}
