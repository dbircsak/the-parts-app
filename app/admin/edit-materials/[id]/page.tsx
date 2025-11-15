"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditMaterialPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 0,
    unit: "",
    reorderLevel: 0,
    supplier: "",
    cost: 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const method = params.id === "new" ? "POST" : "PATCH";
      const res = await fetch(
        `/api/admin/materials/${params.id === "new" ? "" : params.id}`,
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        router.push("/admin/edit-materials");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">
        {params.id === "new" ? "Add Material" : "Edit Material"}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., can, liter, gallon"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Reorder Level
            </label>
            <input
              type="number"
              value={formData.reorderLevel}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reorderLevel: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Supplier</label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) =>
                setFormData({ ...formData, supplier: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cost</label>
            <input
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cost: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
