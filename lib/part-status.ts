export type StatusType = "returned" | "received" | "on_order" | "not_ordered";

export interface PartStatus {
  type: StatusType;
  label: string;
  color: string;
}

export function getPartStatus(
  roQty: number,
  orderedQty: number,
  receivedQty: number,
  returnedQty: number
): PartStatus {
  // 1. LIGHT BLUE – "Returned"
  if (returnedQty > 0 && returnedQty === receivedQty) {
    return { type: "returned", label: "Returned", color: "bg-blue-300" };
  }

  // 2. LIGHT GREEN – "Received" (default)
  if (receivedQty > 0) {
    return { type: "received", label: "Received", color: "bg-green-300" };
  }

  // 3. YELLOW – "Ordered"
  if (orderedQty > 0 && receivedQty === 0) {
    return { type: "on_order", label: "Ordered", color: "bg-yellow-500" };
  }

  // 4. PINK – "Not Ordered"
  if (roQty > 0 && orderedQty === 0 && receivedQty === 0) {
    return { type: "not_ordered", label: "Not Ordered", color: "bg-pink-500" };
  }

  // Default fallback
  return { type: "not_ordered", label: "Not Ordered", color: "bg-pink-500" };
}
