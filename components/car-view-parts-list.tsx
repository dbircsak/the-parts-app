"use client";

import { useState, useMemo } from "react";
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
}

type SortField = keyof Part | "status";
type SortDirection = "asc" | "desc";

const getStatusSortValue = (roQty: number, orderedQty: number, receivedQty: number, returnedQty: number): number => {
  const status = getPartStatus(roQty, orderedQty, receivedQty, returnedQty);
  const order: Record<string, number> = {
    not_ordered: 0,
    on_order: 1,
    received: 2,
    returned: 3,
  };
  return order[status.type] ?? 0;
};

export default function CarViewPartsList({ parts: initialParts }: { parts: Part[] }) {
  const [sortField, setSortField] = useState<SortField>("line");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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
          {sortedParts.map((part) => {
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
  );
}
