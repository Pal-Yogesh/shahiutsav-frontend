import type { AdminAction, PriceType, VendorStatus } from "@/types";

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
