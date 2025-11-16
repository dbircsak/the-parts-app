"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import PartNumberLink from "./part-number-link";

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

type SortField = keyof Part;
type SortDirection = "asc" | "desc";

export default function CarViewPartsList({ parts: initialParts }: { parts: Part[] }) {
  const [sortField, setSortField] = useState<SortField>("line");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedParts = useMemo(() => {
    const filtered = initialParts.filter((part) => part.partType !== "Sublet");
    
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === "string") {
        comparison = aVal.localeCompare(bVal as string);
      } else if (typeof aVal === "number") {
        comparison = (aVal as number) - (bVal as number);
      } else {
        comparison = aVal > bVal ? 1 : -1;
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
      className="text-left py-3 px-2 cursor-pointer hover:bg-gray-100 transition-colors"
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
          {sortedParts.map((part) => (
            <tr key={part.id} className="border-b hover:bg-gray-50">
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
              <td className="py-2 px-2 text-center">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    part.receivedQty >= part.roQty
                      ? "bg-green-100 text-green-800"
                      : part.receivedQty > 0
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {part.receivedQty}
                </span>
              </td>
              <td className="py-2 px-2 text-center">{part.returnedQty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
