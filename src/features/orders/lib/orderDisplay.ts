import type { CustomerOrderListItem } from "@/features/orders/domain/schemas";

/** Short order reference for lists (matches list cards). */
export function formatOrderRef(orderId: string) {
  const tail = orderId.slice(-8).toUpperCase();
  return `ORD-${tail}`;
}

/** Detail header style: ORD-XXXXX-CSA */
export function formatOrderRefCsa(orderId: string) {
  const tail = orderId.slice(-8).toUpperCase();
  return `ORD-${tail}-CSA`;
}

export function formatSubRef(subscriptionId: string) {
  const tail = subscriptionId.slice(-8).toUpperCase();
  return `SUB-${tail}`;
}

export function cycleMonthLabel(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

/** e.g. "Nov 2024 Cycle" */
export function cycleMonthCycleLabel(iso: string | null) {
  const m = cycleMonthLabel(iso);
  return m === "—" ? "—" : `${m} Cycle`;
}

export function dateLabel(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
}

/** Placed on: yyyy-mm-dd HH:mm */
export function placedOnDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const date = d.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${date} ${time}`;
}

export function deliveredTimestampLabel(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function statusLabel(status: CustomerOrderListItem["status"]) {
  switch (status) {
    case "pending":
      return "Pending";
    case "packed":
      return "Packed";
    case "shipped":
      return "In transit";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

export function statusBadgeClass(status: CustomerOrderListItem["status"]) {
  if (status === "delivered") return "bg-[#2F6B2F] text-white";
  if (status === "cancelled") return "bg-destructive/90 text-white";
  return "bg-amber-500/90 text-white";
}

export function deliveryStatusLabel(status: string) {
  switch (status) {
    case "scheduled":
      return "Scheduled";
    case "out_for_delivery":
      return "Out for delivery";
    case "delivered":
      return "Delivered";
    case "failed":
      return "Failed";
    default:
      return status.replace(/_/g, " ");
  }
}

export function deliveryProgressPercent(deliveryStatus: string | null | undefined): number {
  switch (deliveryStatus) {
    case "delivered":
      return 100;
    case "out_for_delivery":
      return 66;
    case "scheduled":
      return 33;
    case "failed":
      return 0;
    default:
      return 0;
  }
}

export function startEndOfMonth(d: Date) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export function startEndOfPreviousMonth(d: Date) {
  const start = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  const end = new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59, 999);
  return { start, end };
}
