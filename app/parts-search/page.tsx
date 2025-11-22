"use client";

import PartsSearchClient from "@/components/parts-search-client";

export default function PartsSearchPage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Parts Search</h1>
      <PartsSearchClient />
    </div>
  );
}
