import { prisma } from "@/lib/prisma";

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { vendorName: "asc" },
  });

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Vendors</h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Vendor Name</th>
              <th className="px-4 py-3 text-left font-semibold">Phone</th>
              <th className="px-4 py-3 text-left font-semibold">Fax</th>
              <th className="px-4 py-3 text-left font-semibold">Address</th>
              <th className="px-4 py-3 text-left font-semibold">City</th>
              <th className="px-4 py-3 text-left font-semibold">State</th>
              <th className="px-4 py-3 text-left font-semibold">Zip</th>
              <th className="px-4 py-3 text-left font-semibold">Preferred</th>
              <th className="px-4 py-3 text-left font-semibold">Electronic</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.vendorName} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{vendor.vendorName}</td>
                <td className="px-4 py-3">{vendor.primaryPhone}</td>
                <td className="px-4 py-3">{vendor.fax}</td>
                <td className="px-4 py-3">{vendor.address}</td>
                <td className="px-4 py-3">{vendor.city}</td>
                <td className="px-4 py-3">{vendor.state}</td>
                <td className="px-4 py-3">{vendor.zip}</td>
                <td className="px-4 py-3">{vendor.preferred ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{vendor.electronic ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {vendors.length === 0 && (
        <p className="text-gray-500">No vendors found.</p>
      )}
    </div>
  );
}
