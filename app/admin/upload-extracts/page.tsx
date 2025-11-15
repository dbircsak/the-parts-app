"use client";

import { useState } from "react";

interface UploadResult {
  success: boolean;
  message: string;
  dailyOut?: { imported: number; errors: number };
  partsStatus?: { imported: number; errors: number };
  vendors?: { imported: number; errors: number };
}

export default function UploadExtractsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/admin/upload-extracts", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Upload failed");
      } else {
        setResult(data);
        e.currentTarget.reset();
      }
    } catch (err) {
      setError("An error occurred during upload");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Upload Extracts</h1>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <form onSubmit={handleFileUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Daily Out CSV
            </label>
            <input
              type="file"
              name="daily_out"
              accept=".csv"
              className="block w-full text-sm text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Parts Status CSV
            </label>
            <input
              type="file"
              name="parts_status"
              accept=".csv"
              className="block w-full text-sm text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Vendors CSV
            </label>
            <input
              type="file"
              name="vendors"
              accept=".csv"
              className="block w-full text-sm text-gray-600"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Uploading..." : "Upload Files"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-green-100 text-green-700 rounded-md">
              {result.message}
            </div>

            {result.dailyOut && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="font-semibold mb-2">Daily Out</h3>
                <p className="text-sm">
                  Imported: {result.dailyOut.imported} | Errors:{" "}
                  {result.dailyOut.errors}
                </p>
              </div>
            )}

            {result.partsStatus && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="font-semibold mb-2">Parts Status</h3>
                <p className="text-sm">
                  Imported: {result.partsStatus.imported} | Errors:{" "}
                  {result.partsStatus.errors}
                </p>
              </div>
            )}

            {result.vendors && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="font-semibold mb-2">Vendors</h3>
                <p className="text-sm">
                  Imported: {result.vendors.imported} | Errors:{" "}
                  {result.vendors.errors}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
