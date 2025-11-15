import { prisma } from "@/lib/prisma";

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { vendorName: "asc" },
  });

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Vendors</h1>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {vendors.map((vendor) => (
          <div key={vendor.vendorName} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">{vendor.vendorName}</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Phone:</span> {vendor.primaryPhone}
              </p>
              <p>
                <span className="font-medium">Fax:</span> {vendor.fax}
              </p>
              <p>
                <span className="font-medium">Address:</span> {vendor.address}
              </p>
              <p>
                <span className="font-medium">City:</span> {vendor.city},{" "}
                {vendor.state} {vendor.zip}
              </p>
              <p>
                <span className="font-medium">Preferred:</span>{" "}
                {vendor.preferred ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-medium">Electronic:</span>{" "}
                {vendor.electronic ? "Yes" : "No"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {vendors.length === 0 && (
        <p className="text-gray-500">No vendors found.</p>
      )}
    </div>
  );
}
