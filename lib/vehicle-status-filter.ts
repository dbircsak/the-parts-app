export type VehicleStatus = "all" | "in-shop" | "pre-order";

export interface VehicleData {
  vehicleIn: string | Date;
  currentPhase?: string;
}

export function filterByVehicleStatus<T extends { dailyOut?: VehicleData }>(
  items: T[],
  status: VehicleStatus
): T[] {
  if (status === "all") {
    return items;
  }

  const now = new Date();
  return items.filter((item) => {
    if (!item.dailyOut) return true;

    const vehicleIn = new Date(item.dailyOut.vehicleIn);
    const isInPast = vehicleIn < now;
    const isNotScheduled = item.dailyOut.currentPhase !== "[Scheduled]";

    switch (status) {
      case "in-shop":
        return isInPast && isNotScheduled;
      case "pre-order":
        return !isInPast;
      default:
        return true;
    }
  });
}
