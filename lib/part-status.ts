export type StatusType = "returned" | "received" | "on_order" | "not_ordered";

export interface PartStatus {
  type: StatusType;
  label: string;
  color: string;
}

export interface StatusConfig {
  type: StatusType;
  label: string;
  color: string;
  emoji: string;
  sortOrder: number;
}

// Single source of truth for all part status configurations
export const PART_STATUS_CONFIG: Record<StatusType, StatusConfig> = {
  not_ordered: {
    type: "not_ordered",
    label: "Not Ordered",
    color: "bg-red-500",
    emoji: "🔴",
    sortOrder: 0,
  },
  on_order: {
    type: "on_order",
    label: "Ordered",
    color: "bg-yellow-500",
    emoji: "🟡",
    sortOrder: 1,
  },
  received: {
    type: "received",
    label: "Received",
    color: "bg-green-500",
    emoji: "🟢",
    sortOrder: 2,
  },
  returned: {
    type: "returned",
    label: "Returned",
    color: "bg-blue-500",
    emoji: "🔵",
    sortOrder: 3,
  },
};

export function getPartStatus(
  roQty: number,
  orderedQty: number,
  receivedQty: number,
  returnedQty: number
): PartStatus {
  if (returnedQty > 0 && returnedQty === receivedQty) {
    const config = PART_STATUS_CONFIG.returned;
    return { type: config.type, label: config.label, color: config.color };
  }

  if (receivedQty > 0) {
    const config = PART_STATUS_CONFIG.received;
    return { type: config.type, label: config.label, color: config.color };
  }

  if (orderedQty > 0 && receivedQty === 0) {
    const config = PART_STATUS_CONFIG.on_order;
    return { type: config.type, label: config.label, color: config.color };
  }

  if (roQty > 0 && orderedQty === 0 && receivedQty === 0) {
    const config = PART_STATUS_CONFIG.not_ordered;
    return { type: config.type, label: config.label, color: config.color };
  }

  const config = PART_STATUS_CONFIG.not_ordered;
  return { type: config.type, label: config.label, color: config.color };
}
