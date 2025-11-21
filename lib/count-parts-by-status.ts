import { getPartStatus } from "./part-status";

export interface PartStatusCount {
  not_ordered: number;
  on_order: number;
  received: number;
  returned: number;
}

/**
 * Filters parts to only include those that should be displayed.
 * This is the single source of truth for part filtering logic.
 * 
 * Rules:
 * - Must have roQty > 0 (part is required for the repair)
 * - Must NOT be partType "Sublet" (sublets are handled separately)
 * 
 * Used by: car-view, production-schedule, and any other part display
 */
export function filterDisplayableParts(
  parts: Array<{
    roQty: number;
    partType: string;
    [key: string]: any;
  }>
): typeof parts {
  return parts.filter((part) => part.roQty > 0 && part.partType !== "Sublet");
}

/**
 * Counts parts by their status using the shared getPartStatus logic.
 * This ensures consistent counting across all pages/components.
 * 
 * @param parts Array of part objects with roQty, orderedQty, receivedQty, returnedQty
 * @returns Object with counts for each status type
 */
export function countPartsByStatus(
  parts: Array<{
    roQty: number;
    orderedQty: number;
    receivedQty: number;
    returnedQty: number;
  }>
): PartStatusCount {
  const counts: PartStatusCount = {
    not_ordered: 0,
    on_order: 0,
    received: 0,
    returned: 0,
  };

  parts.forEach((part) => {
    const status = getPartStatus(part.roQty, part.orderedQty, part.receivedQty, part.returnedQty);
    counts[status.type]++;
  });

  return counts;
}

/**
 * Calculates the percentage of parts that are fully received/returned.
 * 
 * @param counts Part status counts from countPartsByStatus()
 * @returns Percentage (0-100) of parts that are in received or returned status
 */
export function calculatePartsReceivedPercentage(counts: PartStatusCount): number {
  const totalParts = counts.not_ordered + counts.on_order + counts.received + counts.returned;
  
  if (totalParts === 0) {
    // If there are no parts, consider it 100% (nothing to order)
    return 100;
  }

  const receivedOrReturned = counts.received + counts.returned;
  return Math.round((receivedOrReturned / totalParts) * 100);
}
