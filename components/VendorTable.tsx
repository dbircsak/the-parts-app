"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

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

const ITEMS_PER_PAGE = 30;

export default function VendorTable({ vendors }: { vendors: Vendor[] }) {
  const [searchFilter, setSearchFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("vendorName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredAndSortedVendors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedVendors = filteredAndSortedVendors.slice(startIndex, endIndex);

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
        <input
          type="text"
          placeholder="Filter vendors by name, city, or state..."
          value={searchFilter}
          onChange={(e) => {
            setSearchFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedVendors.length)} of {filteredAndSortedVendors.length} vendors (Page {currentPage} of {totalPages})
        </p>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <ColumnHeader field="vendorName" label="Vendor Name" />
              <ColumnHeader field="primaryPhone" label="Phone" />
              <ColumnHeader field="fax" label="Fax" />
              <ColumnHeader field="address" label="Address" />
              <ColumnHeader field="city" label="City" />
              <ColumnHeader field="state" label="State" />
              <ColumnHeader field="zip" label="Zip" />
              <ColumnHeader field="preferred" label="Preferred" />
              <ColumnHeader field="electronic" label="Electronic" />
            </tr>
          </thead>
          <tbody>
            {paginatedVendors.map((vendor) => (
              <tr key={vendor.vendorName} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{vendor.vendorName}</td>
                <td className="px-4 py-3">{vendor.primaryPhone || "-"}</td>
                <td className="px-4 py-3">{vendor.fax || "-"}</td>
                <td className="px-4 py-3">{vendor.address || "-"}</td>
                <td className="px-4 py-3">{vendor.city || "-"}</td>
                <td className="px-4 py-3">{vendor.state || "-"}</td>
                <td className="px-4 py-3">{vendor.zip || "-"}</td>
                <td className="px-4 py-3">{vendor.preferred ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{vendor.electronic ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>

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

      {filteredAndSortedVendors.length === 0 && (
        <p className="text-gray-500 mt-4">No vendors found.</p>
      )}
    </div>
  );
}
