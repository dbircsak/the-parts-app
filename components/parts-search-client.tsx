"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import PartNumberLink from "./part-number-link";
import { getPartStatus, PART_STATUS_CONFIG } from "@/lib/part-status";

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

const ITEMS_PER_PAGE = 30;

export default function PartsSearchClient({ initialParts }: { initialParts: Part[] }) {
  const [searchFilter, setSearchFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("roNumber");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

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
    setCurrentPage(1); // Reset to first page when sorting
  };

  const totalPages = Math.ceil(filteredAndSortedParts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedParts = filteredAndSortedParts.slice(startIndex, endIndex);

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
          <input
            type="text"
            placeholder="Filter by RO, owner, part number, description, or vendor..."
            value={searchFilter}
            onChange={(e) => {
              setSearchFilter(e.target.value);
              setCurrentPage(1); // Reset to first page when filtering
            }}
            className="flex-1 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1); // Reset to first page when changing status filter
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

        <p className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedParts.length)} of {filteredAndSortedParts.length} parts (Page {currentPage} of {totalPages})
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
                {paginatedParts.map((part) => {
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
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-4 py-3 border-t flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-2 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex gap-1">
                {(() => {
                  const pageNumbers = [];
                  const windowSize = 5;
                  const halfWindow = Math.floor(windowSize / 2);
                  
                  let startPage = Math.max(1, currentPage - halfWindow);
                  let endPage = Math.min(totalPages, currentPage + halfWindow);
                  
                  if (endPage - startPage + 1 < windowSize) {
                    if (startPage === 1) {
                      endPage = Math.min(totalPages, windowSize);
                    } else {
                      startPage = Math.max(1, endPage - windowSize + 1);
                    }
                  }
                  
                  if (startPage > 1) {
                    pageNumbers.push(1);
                    if (startPage > 2) {
                      pageNumbers.push('...');
                    }
                  }
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pageNumbers.push(i);
                  }
                  
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pageNumbers.push('...');
                    }
                    pageNumbers.push(totalPages);
                  }
                  
                  return pageNumbers.map((page, idx) => (
                    page === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 py-2">…</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`px-3 py-2 rounded transition-colors ${
                          currentPage === page
                            ? "bg-blue-500 text-white"
                            : "border hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ));
                })()}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-2 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
