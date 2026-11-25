import type { AdminAction, ListingVisibility, PriceType, ServiceStatus, VendorStatus } from "@/types";

export const STATUS_META: Record<VendorStatus, { label: string; adminLabel: string; tone: string; dot: string }> = {
  DRAFT: { label: "In progress", adminLabel: "Incomplete", tone: "border-muted-grey/30 bg-white text-muted-grey", dot: "bg-muted-grey/60" },
  SUBMITTED: { label: "Under review", adminLabel: "To review", tone: "border-gold/50 bg-gold/10 text-gold-deep", dot: "bg-gold" },
  CHANGES_REQUESTED: { label: "Changes requested", adminLabel: "Changes requested", tone: "border-amber-600/30 bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  APPROVED: { label: "Live", adminLabel: "Live", tone: "border-emerald-700/25 bg-emerald-50 text-emerald-800", dot: "bg-emerald-600" },
  REJECTED: { label: "Not approved", adminLabel: "Rejected", tone: "border-burgundy/25 bg-burgundy/[0.05] text-burgundy", dot: "bg-burgundy" },
  SUSPENDED: { label: "Paused", adminLabel: "Suspended", tone: "border-charcoal/20 bg-charcoal/[0.04] text-charcoal", dot: "bg-charcoal" },
};

// Admin queue tabs, in the order work flows through them
export const ADMIN_TABS: VendorStatus[] = ["SUBMITTED", "CHANGES_REQUESTED", "DRAFT", "APPROVED", "SUSPENDED", "REJECTED"];

export const PRICE_TYPES: { value: PriceType; label: string; suffix: string }[] = [
  { value: "STARTING_FROM", label: "Starting from", suffix: "onwards" },
  { value: "FIXED", label: "Fixed per event", suffix: "per event" },
  { value: "PER_HOUR", label: "Per hour", suffix: "per hour" },
  { value: "PER_DAY", label: "Per day", suffix: "per day" },
];

export const ACTION_META: Record<AdminAction, { label: string; verb: string; noteRequired: boolean; danger?: boolean; notePlaceholder: string }> = {
  approve: { label: "Approve & go live", verb: "Approve", noteRequired: false, notePlaceholder: "Optional welcome note for the vendor" },
  request_changes: { label: "Request changes", verb: "Send request", noteRequired: true, notePlaceholder: "Tell the vendor exactly what to fix, e.g. add clearer photos of your setups" },
  reject: { label: "Reject", verb: "Reject", noteRequired: true, danger: true, notePlaceholder: "Reason shared with the vendor" },
  suspend: { label: "Suspend listing", verb: "Suspend", noteRequired: true, danger: true, notePlaceholder: "Reason shared with the vendor" },
  reinstate: { label: "Reinstate", verb: "Reinstate", noteRequired: false, notePlaceholder: "Optional note for the vendor" },
  reopen: { label: "Reopen application", verb: "Reopen", noteRequired: true, notePlaceholder: "What should the vendor change before resubmitting?" },
};

export const PARTNER_TERMS = [
  "The details and photos I share are accurate and my own.",
  "I'll honour confirmed bookings and the prices I list.",
  "ShahiUtsav may verify my business and contact me about my application.",
];

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export function formatDate(iso: string | null, withTime = false) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(new Date(iso));
}

export const SERVICE_STATUS_META: Record<ServiceStatus, { label: string; tone: string; dot: string }> = {
  LIVE: { label: "Live", tone: "border-emerald-700/25 bg-emerald-50 text-emerald-800", dot: "bg-emerald-600" },
  PENDING: { label: "Under review", tone: "border-gold/50 bg-gold/10 text-gold-deep", dot: "bg-gold" },
  REJECTED: { label: "Not approved", tone: "border-burgundy/25 bg-burgundy/[0.05] text-burgundy", dot: "bg-burgundy" },
};

export const VISIBILITY_META: Record<ListingVisibility, { label: string; text: string; tone: string; dot: string }> = {
  live: { label: "Live", text: "Customers can find and book you.", tone: "border-emerald-700/25 bg-emerald-50 text-emerald-800", dot: "bg-emerald-600" },
  paused: { label: "Paused", text: "Your listing is hidden while you're on a break.", tone: "border-charcoal/20 bg-charcoal/[0.04] text-charcoal", dot: "bg-charcoal/60" },
  no_services: { label: "Not visible", text: "Add or resume a service so customers can find you.", tone: "border-amber-600/30 bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  suspended: { label: "Suspended", text: "Our team has paused your listing. Contact us to resolve it.", tone: "border-burgundy/25 bg-burgundy/[0.05] text-burgundy", dot: "bg-burgundy" },
};

export function timeAgo(iso: string) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const units: [number, string][] = [[60, "minute"], [3600, "hour"], [86400, "day"], [604800, "week"]];
  for (let i = units.length - 1; i >= 0; i--) {
    const [size, name] = units[i];
    if (s >= size) {
      const n = Math.floor(s / size);
      return n > 4 && name === "week" ? formatDate(iso) : `${n} ${name}${n > 1 ? "s" : ""} ago`;
    }
  }
  return formatDate(iso);
}

export const BOOKING_ITEM_META: Record<string, { customer: string; vendor: string; tone: string; dot: string }> = {
  PENDING: { customer: "Awaiting vendor", vendor: "New request", tone: "border-gold/50 bg-gold/10 text-gold-deep", dot: "bg-gold" },
  ACCEPTED: { customer: "Confirmed", vendor: "Confirmed", tone: "border-emerald-700/25 bg-emerald-50 text-emerald-800", dot: "bg-emerald-600" },
  COMPLETED: { customer: "Completed", vendor: "Completed", tone: "border-charcoal/15 bg-sand text-charcoal", dot: "bg-charcoal/60" },
  REJECTED: { customer: "Declined", vendor: "Declined", tone: "border-burgundy/25 bg-burgundy/[0.05] text-burgundy", dot: "bg-burgundy" },
  CANCELLED: { customer: "Cancelled", vendor: "Cancelled", tone: "border-charcoal/15 bg-white text-muted-grey", dot: "bg-muted-grey" },
  EXPIRED: { customer: "No reply", vendor: "Expired", tone: "border-charcoal/15 bg-white text-muted-grey", dot: "bg-muted-grey" },
};

export const BOOKING_STATUS_META: Record<string, { label: string; tone: string }> = {
  PENDING: { label: "Awaiting replies", tone: "border-gold/50 bg-gold/10 text-gold-deep" },
  CONFIRMED: { label: "Confirmed", tone: "border-emerald-700/25 bg-emerald-50 text-emerald-800" },
  IN_PROGRESS: { label: "In progress", tone: "border-emerald-700/25 bg-emerald-50 text-emerald-800" },
  COMPLETED: { label: "Completed", tone: "border-charcoal/15 bg-sand text-charcoal" },
  CANCELLED: { label: "Cancelled", tone: "border-charcoal/15 bg-white text-muted-grey" },
};

// Event dates are stored at 12:00 UTC; format in UTC so the day never shifts
export function formatEventDate(iso: string, style: "long" | "short" = "long") {
  return new Intl.DateTimeFormat("en-IN", style === "long" ? { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" } : { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(iso));
}

export function daysUntil(iso: string) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  return Math.round((new Date(iso.slice(0, 10)).getTime() - new Date(today).getTime()) / 86_400_000);
}

export function localDateKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
}
