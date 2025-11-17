"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";
import PartNumberLink from "./part-number-link";
import { getPartStatus } from "@/lib/part-status";

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

export default function PartsSearchClient({ initialParts }: { initialParts: Part[] }) {
  const [searchFilter, setSearchFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("roNumber");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredAndSortedParts = useMemo(() => {
    let filtered = initialParts;

    // Apply text filter
    if (searchFilter.trim()) {
      const lowerFilter = searchFilter.toLowerCase();
      filtered = initialParts.filter(
        (part) =>
          part.roNumber.toString().includes(lowerFilter) ||
          part.owner.toLowerCase().includes(lowerFilter) ||
          part.partNumber.toLowerCase().includes(lowerFilter) ||
          part.partDescription.toLowerCase().includes(lowerFilter) ||
          part.vendorName.toLowerCase().includes(lowerFilter)
      );
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((part) => {
        const status = getPartStatus(part.roQty, part.orderedQty, part.receivedQty, part.returnedQty);
        return status.type === selectedStatus;
      });
    }

    // Apply sort
    return [...filtered].sort((a, b) => {
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
  }, [initialParts, searchFilter, sortField, sortDirection, selectedStatus]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const statusOptions: { value: string; label: string; color?: string }[] = [
    { value: "all", label: "All Statuses" },
    { value: "not_ordered", label: "🔴 Not Ordered", color: "bg-pink-500" },
    { value: "on_order", label: "🟡 Ordered", color: "bg-yellow-500" },
    { value: "received", label: "🟢 Received", color: "bg-green-300" },
    { value: "returned", label: "🔵 Returned", color: "bg-blue-300" },
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
          <input
            type="text"
            placeholder="Filter by RO, owner, part number, description, or vendor..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <p className="text-sm text-gray-600">
          Showing {filteredAndSortedParts.length} of {initialParts.length} parts
        </p>
      </div>

      {filteredAndSortedParts.length === 0 && (
        <p className="text-gray-500">No parts found.</p>
      )}

      {filteredAndSortedParts.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
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
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedParts.map((part) => {
                  const status = getPartStatus(part.roQty, part.orderedQty, part.receivedQty, part.returnedQty);
                  return (
                  <tr key={part.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${status.color}`}
                        title={status.label}
                      />
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <Link
                        href={`/car-view/${part.roNumber}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        {part.roNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-sm">{part.owner}</td>
                    <td className="px-4 py-2 text-sm font-mono">
                      <PartNumberLink partNumber={part.partNumber} />
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {part.partDescription}
                    </td>
                    <td className="px-4 py-2 text-sm">{part.vendorName}</td>
                    <td className="px-4 py-2 text-sm">{part.roQty}</td>
                    <td className="px-4 py-2 text-sm">{part.orderedQty}</td>
                    <td className="px-4 py-2 text-sm">
                      {part.orderedDate ? new Date(part.orderedDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {part.expectedDelivery ? new Date(part.expectedDelivery).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-2 text-sm">{part.receivedQty}</td>
                    <td className="px-4 py-2 text-sm">
                      {part.invoiceDate ? new Date(part.invoiceDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-2 text-sm">{part.returnedQty}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
