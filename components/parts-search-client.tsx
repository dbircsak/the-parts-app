"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

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

type SortField = keyof Part;
type SortDirection = "asc" | "desc";

export default function PartsSearchClient({ initialParts }: { initialParts: Part[] }) {
  const [searchFilter, setSearchFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("roNumber");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const filteredAndSortedParts = useMemo(() => {
    let filtered = initialParts;

    // Apply filter
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

    // Apply sort
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
  }, [initialParts, searchFilter, sortField, sortDirection]);

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

  return (
    <>
      <div className="mb-4 flex flex-col gap-2">
        <input
          type="text"
          placeholder="Filter by RO, owner, part number, description, or vendor..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
                {filteredAndSortedParts.map((part) => (
                  <tr key={part.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{part.roNumber}</td>
                    <td className="px-4 py-2 text-sm">{part.owner}</td>
                    <td className="px-4 py-2 text-sm font-mono">
                      {part.partNumber}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
