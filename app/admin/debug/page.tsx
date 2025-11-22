"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Alert from "@/components/Alert";
import Input from "@/components/Input";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { countPartsByStatus, calculatePartsReceivedPercentage } from "@/lib/count-parts-by-status";
import { getPartStatus } from "@/lib/part-status";

interface DebugData {
  roNumber: number;
  dailyOut: any;
  parts: any[];
  workQueue: any;
  tasks: any[];
  summary: {
    totalParts: number;
    partsWithRoQty: number;
    partsWithoutRoQty: number;
  };
}

export default function DebugPage() {
  const [roNumber, setRoNumber] = useState("");
  const [data, setData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!roNumber.trim()) {
      setError("Please enter an RO number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/debug-ro?roNumber=${roNumber}`);
      if (!response.ok) {
        const errData = await response.json();
        setError(errData.error || "Failed to fetch data");
        setData(null);
      } else {
        const debugData = await response.json();
        setData(debugData);
      }
    } catch (err) {
      setError("Error fetching data");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const statusCounts = data?.parts ? countPartsByStatus(data.parts) : null;
  const partsReceivedPct = statusCounts ? calculatePartsReceivedPercentage(statusCounts) : 0;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Debug: RO Data</h1>

      {/* Search Input */}
      <div className="mb-6 flex gap-2">
        <div className="flex-1 max-w-md">
          <Input
            type="number"
            placeholder="Enter RO number..."
            value={roNumber}
            onChange={(e) => setRoNumber(e.target.value)}
            onKeyPress={handleKeyPress}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={loading}
          variant="primary"
        >
          {loading ? "Loading..." : "Search"}
        </Button>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Header with Link to Car View */}
          <div>
            <h2 className="text-2xl font-bold">
              <Link
                href={`/car-view/${data.roNumber}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                RO {data.roNumber}
              </Link>
            </h2>
          </div>

          {/* Summary */}
          <Card className="bg-blue-50 border border-blue-200 p-4">
            <h2 className="text-xl font-bold mb-3">Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Parts (all)</p>
                <p className="text-2xl font-bold">{data.summary.totalParts}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Parts with roQty &gt; 0</p>
                <p className="text-2xl font-bold">{data.summary.partsWithRoQty}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Parts without roQty</p>
                <p className="text-2xl font-bold">{data.summary.partsWithoutRoQty}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Parts Received %</p>
                <p className="text-2xl font-bold">{partsReceivedPct}%</p>
              </div>
            </div>
            {statusCounts && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm font-semibold mb-2">Status Breakdown (only roQty &gt; 0):</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-red-100 px-3 py-2 rounded">
                    <p className="text-xs text-gray-600">Not Ordered</p>
                    <p className="text-lg font-bold text-red-600">{statusCounts.not_ordered}</p>
                  </div>
                  <div className="bg-yellow-100 px-3 py-2 rounded">
                    <p className="text-xs text-gray-600">On Order</p>
                    <p className="text-lg font-bold text-yellow-600">{statusCounts.on_order}</p>
                  </div>
                  <div className="bg-green-100 px-3 py-2 rounded">
                    <p className="text-xs text-gray-600">Received</p>
                    <p className="text-lg font-bold text-green-600">{statusCounts.received}</p>
                  </div>
                  <div className="bg-blue-100 px-3 py-2 rounded">
                    <p className="text-xs text-gray-600">Returned</p>
                    <p className="text-lg font-bold text-blue-600">{statusCounts.returned}</p>
                  </div>
                </div>
              </div>
              )}
              </Card>

          {/* Daily Out Data */}
          {data.dailyOut && (
            <Card className="p-4">
              <h2 className="text-xl font-bold mb-3">Daily Out (Car)</h2>
              <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(data.dailyOut, null, 2)}
              </pre>
            </Card>
          )}

          {/* Work Queue Data */}
          {data.workQueue && (
            <Card className="p-4">
              <h2 className="text-xl font-bold mb-3">Work Queue</h2>
              <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(data.workQueue, null, 2)}
              </pre>
            </Card>
          )}

          {/* Parts Table */}
          {data.parts.length > 0 && (
            <Card className="p-4">
              <h2 className="text-xl font-bold mb-3">Parts ({data.parts.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-3 py-2 text-left">Line</th>
                      <th className="px-3 py-2 text-left">Part #</th>
                      <th className="px-3 py-2 text-left">Description</th>
                      <th className="px-3 py-2 text-center">RO Qty</th>
                      <th className="px-3 py-2 text-center">Ord Qty</th>
                      <th className="px-3 py-2 text-center">Rcv Qty</th>
                      <th className="px-3 py-2 text-center">Ret Qty</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.parts.map((part, idx) => {
                      const status = getPartStatus(
                        part.roQty,
                        part.orderedQty,
                        part.receivedQty,
                        part.returnedQty
                      );
                      return (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2">{part.line}</td>
                          <td className="px-3 py-2 font-mono">{part.partNumber}</td>
                          <td className="px-3 py-2 text-xs">{part.partDescription}</td>
                          <td className="px-3 py-2 text-center font-semibold">{part.roQty}</td>
                          <td className="px-3 py-2 text-center">{part.orderedQty}</td>
                          <td className="px-3 py-2 text-center">{part.receivedQty}</td>
                          <td className="px-3 py-2 text-center">{part.returnedQty}</td>
                          <td className={`px-3 py-2 font-semibold ${status.color} text-white rounded`}>
                            {status.label}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
                </Card>
                )}

                {/* Raw JSON Data */}
                <Card className="p-4">
                <h2 className="text-xl font-bold mb-3">Raw JSON (Full Response)</h2>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(data, null, 2)}
                </pre>
                </Card>
        </div>
      )}

      {!data && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500">Enter an RO number and click Search to see debug data</p>
        </div>
      )}
    </div>
  );
}
