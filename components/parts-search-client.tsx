"use client";

import { useState } from "react";

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
  orderedDate: string | null;
  expectedDelivery: string | null;
  receivedQty: number;
}

export default function PartsSearchClient() {
  const [query, setQuery] = useState("");
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;

    setIsLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/parts/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setParts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by RO, part number, or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {searched && parts.length === 0 && !isLoading && (
        <p className="text-gray-500">No parts found.</p>
      )}

      {parts.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium">RO</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">
                    Part Number
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium">
                    Description
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium">
                    Vendor
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium">
                    Qty
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium">
                    Ordered
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium">
                    Received
                  </th>
                </tr>
              </thead>
              <tbody>
                {parts.map((part) => (
                  <tr key={part.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{part.roNumber}</td>
                    <td className="px-4 py-2 text-sm font-mono">
                      {part.partNumber}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {part.partDescription}
                    </td>
                    <td className="px-4 py-2 text-sm">{part.partType}</td>
                    <td className="px-4 py-2 text-sm">{part.vendorName}</td>
                    <td className="px-4 py-2 text-sm">{part.roQty}</td>
                    <td className="px-4 py-2 text-sm">{part.orderedQty}</td>
                    <td className="px-4 py-2 text-sm">{part.receivedQty}</td>
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
