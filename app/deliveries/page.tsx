"use client";

import { useState, useEffect } from "react";

type ViewMode = "car" | "vendor";

interface CarDeliveryData {
  roNumber: number;
  owner: string;
  vehicle: string;
  bodyTechnician: string;
  estimator: string;
  vendors: {
    vendorName: string;
    parts: {
      partDescription: string;
      partNumber: string;
      receivedQty: number;
      invoiceDate: string | null;
    }[];
  }[];
}

interface VendorDeliveryData {
  vendorName: string;
  cars: {
    roNumber: number;
    owner: string;
    vehicle: string;
    bodyTechnician: string;
    estimator: string;
    parts: {
      partDescription: string;
      partNumber: string;
      receivedQty: number;
      invoiceDate: string | null;
    }[];
  }[];
}

export default function DeliveriesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("car");
  const [carData, setCarData] = useState<CarDeliveryData[]>([]);
  const [vendorData, setVendorData] = useState<VendorDeliveryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await fetch("/api/deliveries");
        const data = await response.json();
        setCarData(data.carView);
        setVendorData(data.vendorView);
      } catch (error) {
        console.error("Failed to fetch deliveries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6">Deliveries</h1>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Deliveries</h1>

      {/* View Mode Filter */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setViewMode("car")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            viewMode === "car"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          View by Car
        </button>
        <button
          onClick={() => setViewMode("vendor")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            viewMode === "vendor"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          View by Vendor
        </button>
      </div>

      {/* Car View */}
      {viewMode === "car" && (
        <div className="space-y-8">
          {carData.length === 0 ? (
            <p className="text-gray-500">No deliveries found.</p>
          ) : (
            carData.map((car) => (
              <div
                key={car.roNumber}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                {/* Car Header */}
                <div className="bg-blue-50 px-6 py-4 border-b-2 border-blue-200">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">RO Number</p>
                      <p className="text-lg font-bold">{car.roNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Owner</p>
                      <p className="font-semibold">{car.owner}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Vehicle</p>
                      <p className="font-semibold">{car.vehicle}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Body Tech</p>
                      <p className="font-semibold">{car.bodyTechnician}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Estimator</p>
                      <p className="font-semibold">{car.estimator}</p>
                    </div>
                  </div>
                </div>

                {/* Vendors */}
                <div className="divide-y">
                  {car.vendors.map((vendor, vendorIdx) => (
                    <div key={vendorIdx} className="px-6 py-4">
                      {/* Vendor Name */}
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 bg-gray-100 px-3 py-2 rounded">
                        {vendor.vendorName}
                      </h3>

                      {/* Parts Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 border-b">
                              <th className="px-3 py-2 text-left font-medium text-gray-700">
                                Part Description
                              </th>
                              <th className="px-3 py-2 text-left font-medium text-gray-700">
                                Part Number
                              </th>
                              <th className="px-3 py-2 text-center font-medium text-gray-700">
                                Received Qty
                              </th>
                              <th className="px-3 py-2 text-left font-medium text-gray-700">
                                Invoice Date
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {vendor.parts.map((part, partIdx) => (
                              <tr key={partIdx} className="border-b hover:bg-gray-50">
                                <td className="px-3 py-2">{part.partDescription}</td>
                                <td className="px-3 py-2 font-mono text-xs">
                                  {part.partNumber}
                                </td>
                                <td className="px-3 py-2 text-center font-semibold">
                                  {part.receivedQty}
                                </td>
                                <td className="px-3 py-2">
                                  {part.invoiceDate
                                    ? new Date(part.invoiceDate).toLocaleDateString()
                                    : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Vendor View */}
      {viewMode === "vendor" && (
        <div className="space-y-8">
          {vendorData.length === 0 ? (
            <p className="text-gray-500">No deliveries found.</p>
          ) : (
            vendorData.map((vendor) => (
              <div
                key={vendor.vendorName}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                {/* Vendor Header */}
                <div className="bg-green-50 px-6 py-4 border-b-2 border-green-200">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {vendor.vendorName}
                  </h2>
                </div>

                {/* Cars */}
                <div className="divide-y">
                  {vendor.cars.map((car, carIdx) => (
                    <div key={carIdx} className="px-6 py-4">
                      {/* Car Info */}
                      <div className="bg-blue-50 px-4 py-3 rounded mb-4 border border-blue-200">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 font-medium">RO Number</p>
                            <p className="text-lg font-bold">{car.roNumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Owner</p>
                            <p className="font-semibold">{car.owner}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Vehicle</p>
                            <p className="font-semibold">{car.vehicle}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Body Tech</p>
                            <p className="font-semibold">{car.bodyTechnician}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Estimator</p>
                            <p className="font-semibold">{car.estimator}</p>
                          </div>
                        </div>
                      </div>

                      {/* Parts Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 border-b">
                              <th className="px-3 py-2 text-left font-medium text-gray-700">
                                Part Description
                              </th>
                              <th className="px-3 py-2 text-left font-medium text-gray-700">
                                Part Number
                              </th>
                              <th className="px-3 py-2 text-center font-medium text-gray-700">
                                Received Qty
                              </th>
                              <th className="px-3 py-2 text-left font-medium text-gray-700">
                                Invoice Date
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {car.parts.map((part, partIdx) => (
                              <tr key={partIdx} className="border-b hover:bg-gray-50">
                                <td className="px-3 py-2">{part.partDescription}</td>
                                <td className="px-3 py-2 font-mono text-xs">
                                  {part.partNumber}
                                </td>
                                <td className="px-3 py-2 text-center font-semibold">
                                  {part.receivedQty}
                                </td>
                                <td className="px-3 py-2">
                                  {part.invoiceDate
                                    ? new Date(part.invoiceDate).toLocaleDateString()
                                    : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
