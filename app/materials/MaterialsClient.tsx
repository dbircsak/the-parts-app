"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Material {
  id: string;
  bodyTechnician: string;
  partNumber: string;
  description: string;
  orderedQty: number;
  orderedDate: Date | null;
  unitType: string;
  receivedQty: number;
  receivedDate: Date | null;
}

interface MaterialsClientProps {
  initialMaterials: Material[];
  bodyTechnicians: string[];
}

export default function MaterialsClient({ initialMaterials, bodyTechnicians }: MaterialsClientProps) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sortField, setSortField] = useState<keyof Material>("orderedDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedBodyTechnician, setSelectedBodyTechnician] = useState<string>("");
  const [formData, setFormData] = useState({
    bodyTechnician: "",
    partNumber: "",
    description: "",
    orderedQty: "",
    orderedDate: "",
    unitType: "",
    receivedQty: "",
    receivedDate: "",
  });

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const handleSort = (field: keyof Material) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getFilteredAndSortedMaterials = () => {
    let filtered = materials;
    if (selectedBodyTechnician) {
      filtered = materials.filter(m => m.bodyTechnician === selectedBodyTechnician);
    }

    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === null && bValue === null) return a.id.localeCompare(b.id);
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      if (typeof aValue === "string") {
        const comparison = sortDirection === "asc"
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
        return comparison !== 0 ? comparison : a.id.localeCompare(b.id);
      }

      if (typeof aValue === "number") {
        const comparison = sortDirection === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
        return comparison !== 0 ? comparison : a.id.localeCompare(b.id);
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        const comparison = sortDirection === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
        return comparison !== 0 ? comparison : a.id.localeCompare(b.id);
      }

      return a.id.localeCompare(b.id);
    });
    return sorted;
  };

  const SortHeader = ({ field, label }: { field: keyof Material; label: string }) => (
    <th
      onClick={() => handleSort(field)}
      className="px-4 py-2 text-left text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors"
    >
      {label}
      {sortField === field && (
        sortDirection === "asc" ? (
          <ChevronUp className="w-4 h-4 inline ml-1" />
        ) : (
          <ChevronDown className="w-4 h-4 inline ml-1" />
        )
      )}
    </th>
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bodyTechnician: formData.bodyTechnician,
          partNumber: formData.partNumber,
          description: formData.description,
          orderedQty: parseInt(formData.orderedQty) || 0,
          orderedDate: formData.orderedDate ? new Date(formData.orderedDate) : null,
          unitType: formData.unitType,
          receivedQty: parseInt(formData.receivedQty) || 0,
          receivedDate: formData.receivedDate ? new Date(formData.receivedDate) : null,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("API error response:", data);
        throw new Error(data.error || "Failed to add material");
      }

      const newMaterial = data;
      setMaterials((prev) => [newMaterial, ...prev]);
      setSelectedBodyTechnician("");
      setFormData({
        bodyTechnician: "",
        partNumber: "",
        description: "",
        orderedQty: "",
        orderedDate: "",
        unitType: "",
        receivedQty: "",
        receivedDate: "",
      });
    } catch (error) {
      console.error("Error adding material:", error);
      alert(error instanceof Error ? error.message : "Failed to add material");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Materials</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "Add Material"}
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Body Technician
        </label>
        <select
          value={selectedBodyTechnician}
          onChange={(e) => setSelectedBodyTechnician(e.target.value)}
          className="px-3 py-2 border rounded-md w-full md:w-64"
        >
          <option value="">All Body Technicians</option>
          {bodyTechnicians.map((bodyTechnician) => (
            <option key={bodyTechnician} value={bodyTechnician}>
              {bodyTechnician}
            </option>
          ))}
        </select>
      </div>
    
      {materials.length === 0 && (
        <p className="text-gray-500">No materials on order.</p>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Add New Material</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-40">Body Technician</label>
              <select
                name="bodyTechnician"
                value={formData.bodyTechnician}
                onChange={handleInputChange}
                required
                className="flex-1 px-3 py-2 border rounded-md"
              >
                <option value="">Select Body Technician</option>
                {bodyTechnicians.map((bodyTechnician) => (
                  <option key={bodyTechnician} value={bodyTechnician}>
                    {bodyTechnician}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-40">Part Number</label>
              <input
                type="text"
                name="partNumber"
                value={formData.partNumber}
                onChange={handleInputChange}
                required
                className="flex-1 px-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-40">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="flex-1 px-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-40">Ordered Qty</label>
              <input
                type="number"
                name="orderedQty"
                value={formData.orderedQty}
                onChange={handleInputChange}
                max="2147483647"
                required
                className="flex-1 px-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-40">Ordered Date</label>
              <input
                type="date"
                name="orderedDate"
                value={formData.orderedDate}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-40">Unit Type</label>
              <input
                type="text"
                name="unitType"
                value={formData.unitType}
                onChange={handleInputChange}
                required
                className="flex-1 px-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-40">Received Qty</label>
              <input
                type="number"
                name="receivedQty"
                value={formData.receivedQty}
                onChange={handleInputChange}
                max="2147483647"
                required
                className="flex-1 px-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-40">Received Date</label>
              <input
                type="date"
                name="receivedDate"
                value={formData.receivedDate}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border rounded-md"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 disabled:bg-gray-400"
            >
              {isLoading ? "Adding..." : "Add Material"}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <SortHeader field="bodyTechnician" label="Body Technician" />
                <SortHeader field="partNumber" label="Part Number" />
                <SortHeader field="description" label="Description" />
                <SortHeader field="orderedQty" label="Ordered Qty" />
                <SortHeader field="orderedDate" label="Ordered Date" />
                <SortHeader field="unitType" label="Unit Type" />
                <SortHeader field="receivedQty" label="Received Qty" />
                <SortHeader field="receivedDate" label="Received Date" />
              </tr>
            </thead>
            <tbody>
              {getFilteredAndSortedMaterials().map((material) => (
                <tr key={material.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm font-medium">
                    {material.bodyTechnician}
                  </td>
                  <td className="px-4 py-2 text-sm font-medium">
                    {material.partNumber}
                  </td>
                  <td className="px-4 py-2 text-sm">{material.description}</td>
                  <td className="px-4 py-2 text-sm">{material.orderedQty}</td>
                  <td className="px-4 py-2 text-sm">
                    {material.orderedDate ? formatDate(new Date(material.orderedDate)) : "-"}
                  </td>
                  <td className="px-4 py-2 text-sm">{material.unitType}</td>
                  <td className="px-4 py-2 text-sm">{material.receivedQty}</td>
                  <td className="px-4 py-2 text-sm">
                    {material.receivedDate ? formatDate(new Date(material.receivedDate)) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
