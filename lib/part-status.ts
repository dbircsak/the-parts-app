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
  // 1. BLUE – "Returned"
  if (returnedQty > 0 && returnedQty >= receivedQty) {
    return { type: "returned", label: "Returned", color: "bg-blue-500" };
  }

  // 2. GREEN – "Received"
  const netReceived = receivedQty - returnedQty;
  if (netReceived >= roQty && roQty > 0) {
    return { type: "received", label: "Received", color: "bg-green-500" };
  }

  // 3. YELLOW – "On Order"
  if (orderedQty > 0) {
    return { type: "on_order", label: "On Order", color: "bg-yellow-500" };
  }

  // 4. RED – "Not Ordered"
  if (roQty > 0 && orderedQty === 0 && receivedQty === 0 && returnedQty === 0) {
    return { type: "not_ordered", label: "Not Ordered", color: "bg-red-500" };
  }

  // Default fallback – treat as "On Order" if we have any ordered/received/returned quantities
  // Otherwise default to "Not Ordered"
  if (orderedQty > 0 || receivedQty > 0 || returnedQty > 0) {
    return { type: "on_order", label: "On Order", color: "bg-yellow-500" };
  }

  return { type: "not_ordered", label: "Not Ordered", color: "bg-red-500" };
}
