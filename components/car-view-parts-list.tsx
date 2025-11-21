"use client";

import { useState, useMemo } from "react";
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
}

type SortField = keyof Part | "status";
type SortDirection = "asc" | "desc";

const getStatusSortValue = (roQty: number, orderedQty: number, receivedQty: number, returnedQty: number): number => {
  const status = getPartStatus(roQty, orderedQty, receivedQty, returnedQty);
  return PART_STATUS_CONFIG[status.type].sortOrder;
};

const ITEMS_PER_PAGE = 30;

export default function CarViewPartsList({ parts: initialParts }: { parts: Part[] }) {
  const [sortField, setSortField] = useState<SortField>("line");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const sortedParts = useMemo(() => {
    const filtered = initialParts.filter((part) => part.partType !== "Sublet");
    
    return [...filtered].sort((a, b) => {
      let comparison = 0;

      if (sortField === "status") {
        const aVal = getStatusSortValue(a.roQty, a.orderedQty, a.receivedQty, a.returnedQty);
        const bVal = getStatusSortValue(b.roQty, b.orderedQty, b.receivedQty, b.returnedQty);
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
  }, [initialParts, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(sortedParts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedParts = sortedParts.slice(startIndex, endIndex);

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

  if (sortedParts.length === 0) {
    return <p className="text-gray-500">No parts found for this repair order.</p>;
  }

  return (
    <div className="flex flex-col">
      <div className="mb-4 text-sm text-gray-600">
        Showing {startIndex + 1}-{Math.min(endIndex, sortedParts.length)} of {sortedParts.length} parts (Page {currentPage} of {totalPages})
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th
                className="px-4 py-2 text-left text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors"
                title="Status"
                onClick={() => handleSort("status")}
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
              <ColumnHeader field="line" label="Line" />
              <ColumnHeader field="partNumber" label="Part Number" />
              <ColumnHeader field="partDescription" label="Description" />
              <ColumnHeader field="partType" label="Type" />
              <ColumnHeader field="vendorName" label="Vendor" />
              <ColumnHeader field="roQty" label="RO Qty" />
              <ColumnHeader field="orderedQty" label="Ordered Qty" />
              <ColumnHeader field="orderedDate" label="Ordered Date" />
              <ColumnHeader field="expectedDelivery" label="Expected Delivery" />
              <ColumnHeader field="invoiceDate" label="Invoice Date" />
              <ColumnHeader field="receivedQty" label="Received Qty" />
              <ColumnHeader field="returnedQty" label="Returned Qty" />
            </tr>
          </thead>
          <tbody>
            {paginatedParts.map((part) => {
              const status = getPartStatus(part.roQty, part.orderedQty, part.receivedQty, part.returnedQty);
              return (
              <tr key={part.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-2 text-sm flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${status.color}`}
                    title={status.label}
                  />
                </td>
                <td className="py-2 px-2">{part.line}</td>
                <td className="py-2 px-2 font-mono text-xs">
                  <PartNumberLink partNumber={part.partNumber} />
                </td>
                <td className="py-2 px-2 max-w-xs truncate">{part.partDescription}</td>
                <td className="py-2 px-2">{part.partType}</td>
                <td className="py-2 px-2">{part.vendorName}</td>
                <td className="py-2 px-2 text-center">{part.roQty}</td>
                <td className="py-2 px-2 text-center">{part.orderedQty}</td>
                <td className="py-2 px-2">
                  {part.orderedDate?.toLocaleDateString() || "-"}
                </td>
                <td className="py-2 px-2">
                  {part.expectedDelivery?.toLocaleDateString() || "-"}
                </td>
                <td className="py-2 px-2">
                  {part.invoiceDate?.toLocaleDateString() || "-"}
                </td>
                <td className="py-2 px-2 text-center">{part.receivedQty}</td>
                <td className="py-2 px-2 text-center">{part.returnedQty}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-4 py-3 border-t border-l border-r border-gray-200 rounded-b-lg flex items-center justify-center gap-2 mt-4">
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
  );
}
