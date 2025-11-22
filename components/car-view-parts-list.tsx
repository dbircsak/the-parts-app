"use client";

import { useState, useMemo } from "react";
import PartNumberLink from "./part-number-link";
import { getPartStatus, PART_STATUS_CONFIG } from "@/lib/part-status";
import { filterDisplayableParts } from "@/lib/count-parts-by-status";
import { usePagination } from "@/lib/usePagination";
import PaginationControls from "./PaginationControls";
import Table from "./Table";
import TableHeader from "./TableHeader";

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

export default function CarViewPartsList({ parts: initialParts }: { parts: Part[] }) {
  const [sortField, setSortField] = useState<SortField>("line");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedParts = useMemo(() => {
    // Use shared filtering logic (roQty > 0 and not Sublet)
    const filtered = filterDisplayableParts(initialParts);
    
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

  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    paginatedItems: paginatedParts,
    setCurrentPage,
    resetPage,
  } = usePagination(sortedParts);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    resetPage();
  };



  if (sortedParts.length === 0) {
    return <p className="text-gray-500">No parts found for this repair order.</p>;
  }

  return (
    <div className="flex flex-col">
      <div className="mb-4 text-sm text-gray-600">
        Showing {startIndex + 1}-{Math.min(endIndex, sortedParts.length)} of {sortedParts.length} parts (Page {currentPage} of {totalPages})
      </div>
      
      <Table>
        <Table.Head>
          <Table.Row>
            <TableHeader field="status" label="Status" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <TableHeader field="line" label="Line" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <TableHeader field="partNumber" label="Part Number" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <TableHeader field="partDescription" label="Description" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <TableHeader field="partType" label="Type" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <TableHeader field="vendorName" label="Vendor" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <TableHeader field="roQty" label="RO Qty" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <TableHeader field="orderedQty" label="Ordered Qty" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <TableHeader field="orderedDate" label="Ordered Date" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <TableHeader field="expectedDelivery" label="Expected Delivery" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <TableHeader field="invoiceDate" label="Invoice Date" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <TableHeader field="receivedQty" label="Received Qty" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
            <TableHeader field="returnedQty" label="Returned Qty" currentSortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
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
              <Table.Cell>{part.line}</Table.Cell>
              <Table.Cell className="font-mono text-xs">
                <PartNumberLink partNumber={part.partNumber} />
              </Table.Cell>
              <Table.Cell className="max-w-xs truncate">{part.partDescription}</Table.Cell>
              <Table.Cell>{part.partType}</Table.Cell>
              <Table.Cell>{part.vendorName}</Table.Cell>
              <Table.Cell className="text-center">{part.roQty}</Table.Cell>
              <Table.Cell className="text-center">{part.orderedQty}</Table.Cell>
              <Table.Cell>
                {part.orderedDate?.toLocaleDateString() || "-"}
              </Table.Cell>
              <Table.Cell>
                {part.expectedDelivery?.toLocaleDateString() || "-"}
              </Table.Cell>
              <Table.Cell>
                {part.invoiceDate?.toLocaleDateString() || "-"}
              </Table.Cell>
              <Table.Cell className="text-center">{part.receivedQty}</Table.Cell>
              <Table.Cell className="text-center">{part.returnedQty}</Table.Cell>
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
  );
}
