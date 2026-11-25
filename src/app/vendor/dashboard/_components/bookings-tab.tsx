"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { CalendarDays, Check, CheckCheck, Inbox, Loader2, Lock, Mail, MapPin, MessageSquare, Phone, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import { BOOKING_ITEM_META, daysUntil, formatEventDate, formatINR, timeAgo } from "@/config/vendor";
import type { VendorBookingItem, VendorBookingList, VendorBookingView } from "@/types";
import { useDashboard } from "./vendor-dashboard";

const VIEWS: { id: VendorBookingView; label: string; empty: string }[] = [
  { id: "requests", label: "Requests", empty: "No new requests right now. They'll appear here, and we'll email you too." },
  { id: "upcoming", label: "Upcoming", empty: "No confirmed events coming up." },
  { id: "completion", label: "To complete", empty: "Nothing to mark complete." },
  { id: "history", label: "History", empty: "Past, declined and cancelled bookings will appear here." },
];

const DECLINE_REASONS = ["Already booked on this date", "Not available in that city", "Outside our services", "Budget doesn't match"];

type Load = { state: "loading" } | { state: "error"; message: string } | { state: "ready"; data: VendorBookingList };

export function BookingsTab() {
  const { readOnly } = useDashboard();
  const [view, setView] = useState<VendorBookingView>("requests");
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    clientApi<VendorBookingList>(`/api/vendor-portal/bookings?view=${view}`, { signal: ctrl.signal })
      .then((r) => setLoad(r.ok ? { state: "ready", data: r.data } : { state: "error", message: r.error }))
      .catch(() => {});
    return () => ctrl.abort();
  }, [view, nonce]);

  // After an action the item usually moves to another view, so refetch the list and counts
  const refresh = useCallback(() => setNonce((n) => n + 1), []);
  const counts = load.state === "ready" ? load.data.counts : null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-charcoal">Bookings</h2>
          <p className="mt-1 text-sm text-muted-grey">Reply to requests quickly: customers usually book whoever answers first.</p>
        </div>
      </div>

      <div role="tablist" aria-label="Booking views" className="mt-6 flex gap-1 overflow-x-auto border-b border-champagne">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            role="tab"
            aria-selected={v.id === view}
            onClick={() => {
              setLoad({ state: "loading" });
              setView(v.id);
            }}
            className={cn("relative flex shrink-0 items-center gap-2 px-4 pb-3 pt-2 text-sm", v.id === view ? "text-burgundy" : "text-charcoal/65 hover:text-charcoal")}
          >
            {v.label}
            {counts && counts[v.id] > 0 && (
              <span className={cn("min-w-5 px-1.5 text-center text-[0.68rem] leading-5", v.id === view ? "bg-burgundy text-ivory" : (v.id === "requests" || v.id === "completion") ? "bg-gold text-charcoal" : "bg-sand text-muted-grey")}>
                {counts[v.id]}
              </span>
            )}
            {v.id === view && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-burgundy" />}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {load.state === "loading" && (
          <div className="flex justify-center py-20" role="status">
            <Loader2 className="size-6 animate-spin text-gold-deep" />
          </div>
        )}
        {load.state === "error" && <p className="py-16 text-center text-sm text-burgundy">{load.message}</p>}
        {load.state === "ready" && load.data.items.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <Inbox className="size-10 text-champagne" strokeWidth={1.25} />
            <p className="mt-4 max-w-sm text-sm text-muted-grey">{VIEWS.find((v) => v.id === view)!.empty}</p>
          </div>
        )}
        {load.state === "ready" && load.data.items.length > 0 && (
          <ul className="grid gap-5 xl:grid-cols-2">
            <AnimatePresence initial={false}>
              {load.data.items.map((item) => (
                <m.li key={item.id} layout exit={{ opacity: 0, scale: 0.97 }}>
                  <BookingCard item={item} readOnly={readOnly} onDone={refresh} />
                </m.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}

type Mode = null | "accept" | "decline" | "cancel";

function BookingCard({ item: i, readOnly, onDone }: { item: VendorBookingItem; readOnly: boolean; onDone: () => void }) {
  const { act: refreshDashboard } = useDashboard();
  const [mode, setMode] = useState<Mode>(null);
  const [price, setPrice] = useState(String(i.price));
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const b = i.booking;
  const days = daysUntil(b.eventDate);
  const meta = BOOKING_ITEM_META[i.expired ? "EXPIRED" : i.status];
  const confirmed = i.status === "ACCEPTED" || i.status === "COMPLETED";

  async function run(path: string, body: unknown) {
    setBusy(true);
    setError("");
    const r = await clientApi<VendorBookingItem>(`/api/vendor-portal/bookings/${i.id}/${path}`, { method: "POST", body });
    setBusy(false);
    if (!r.ok) return setError(r.fieldErrors.reason ?? r.fieldErrors.price ?? r.error);
    onDone();
    // Keep the overview numbers in step
    void refreshDashboard("/dashboard", "GET", undefined, path === "accept" ? "Booking confirmed. The customer has been told." : path === "decline" ? "Request declined" : path === "complete" ? "Marked as completed" : "Booking cancelled");
  }

  return (
    <article className="h-full border border-champagne bg-white">
      <div className="flex items-start gap-4 border-b border-champagne/70 p-5">
        <div className="w-14 shrink-0 border border-gold/40 py-1.5 text-center">
          <p className="text-[0.62rem] uppercase tracking-wider text-gold-deep">{new Date(b.eventDate).toLocaleString("en-IN", { month: "short", timeZone: "UTC" })}</p>
          <p className="font-serif text-2xl leading-none text-charcoal">{new Date(b.eventDate).getUTCDate()}</p>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-charcoal">
                {b.eventType} · {i.service.title}
              </p>
              <p className="text-xs text-muted-grey">
                {formatEventDate(b.eventDate)}
                {days >= 0 && (i.status === "PENDING" || i.status === "ACCEPTED") && ` · ${days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`}`}
              </p>
            </div>
            <span className={cn("inline-flex shrink-0 items-center gap-1.5 border px-2 py-0.5 text-[0.7rem]", meta.tone)}>
              <span className={cn("size-1.5 rounded-full", meta.dot)} /> {meta.vendor}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5 text-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <Fact icon={MapPin} value={[b.venue, b.city.name].filter(Boolean).join(", ")} />
          {b.guestCount && <Fact icon={Users} value={`${b.guestCount} guests`} />}
          <Fact icon={CalendarDays} value={`Requested ${timeAgo(i.createdAt)}`} />
          <Fact icon={Users} value={`${b.customer.name}${b.otherServices ? ` · also booking ${b.otherServices} other service${b.otherServices > 1 ? "s" : ""}` : ""}`} />
        </div>
        {(i.notes || b.notes) && (
          <div className="flex gap-2 bg-sand/60 p-3 text-charcoal/85">
            <MessageSquare className="mt-0.5 size-4 shrink-0 text-gold-deep" />
            <p className="whitespace-pre-line">{[i.notes, b.notes].filter(Boolean).join("\n")}</p>
          </div>
        )}

        <div className="flex items-baseline justify-between border-t border-champagne/60 pt-3">
          <span className="text-muted-grey">{confirmed ? "Agreed price" : "Listed price"}</span>
          <span className="font-serif text-2xl text-charcoal">
            {formatINR(i.price)}
            {i.listedPrice != null && i.listedPrice !== i.price && <span className="ml-2 font-sans text-xs text-muted-grey line-through">{formatINR(i.listedPrice)}</span>}
          </span>
        </div>

        {/* Customer contact: only after accepting */}
        {confirmed && (b.customer.phone || b.customer.email) ? (
          <div className="flex flex-wrap gap-2">
            {b.customer.phone && (
              <a href={`tel:+91${b.customer.phone}`} className="inline-flex h-9 items-center gap-2 border border-champagne px-3 text-xs font-medium hover:border-burgundy hover:text-burgundy">
                <Phone className="size-3.5" /> +91 {b.customer.phone}
              </a>
            )}
            {b.customer.phone && (
              <a href={`https://wa.me/91${b.customer.phone}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 bg-emerald-700 px-3 text-xs font-medium text-white">
                WhatsApp
              </a>
            )}
            {b.customer.email && (
              <a href={`mailto:${b.customer.email}`} className="inline-flex h-9 items-center gap-2 border border-champagne px-3 text-xs font-medium hover:border-burgundy hover:text-burgundy">
                <Mail className="size-3.5" /> Email
              </a>
            )}
          </div>
        ) : (
          i.status === "PENDING" && (
            <p className="flex items-center gap-1.5 text-xs text-muted-grey">
              <Lock className="size-3.5" /> The customer&apos;s phone and email appear once you accept.
            </p>
          )
        )}

        {i.vendorNote && <p className="border-l-2 border-gold pl-3 text-xs text-charcoal/75">Your note: {i.vendorNote}</p>}
        {i.declineReason && <p className="border-l-2 border-burgundy/40 pl-3 text-xs text-burgundy">Declined: {i.declineReason}</p>}
        {i.cancelReason && (
          <p className="border-l-2 border-burgundy/40 pl-3 text-xs text-burgundy">
            Cancelled by {i.cancelledBy === "vendor" ? "you" : "the customer"}: {i.cancelReason}
          </p>
        )}
        {i.status === "CANCELLED" && !i.cancelReason && <p className="text-xs text-muted-grey">Cancelled by {i.cancelledBy === "vendor" ? "you" : "the customer"}.</p>}
      </div>

      {!readOnly && (i.canAccept || i.canDecline || i.canComplete || i.canCancel) && (
        <div className="border-t border-champagne/70 p-5">
          <AnimatePresence mode="wait" initial={false}>
            {mode === null ? (
              <m.div key="buttons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-wrap gap-2">
                {i.canAccept && (
                  <button type="button" onClick={() => setMode("accept")} className="inline-flex h-10 items-center gap-2 bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800">
                    <Check className="size-4" /> Accept
                  </button>
                )}
                {i.canDecline && (
                  <button type="button" onClick={() => setMode("decline")} className="inline-flex h-10 items-center gap-2 border border-burgundy/30 px-4 text-sm text-burgundy hover:bg-burgundy/[0.04]">
                    <X className="size-4" /> Decline
                  </button>
                )}
                {i.canComplete && (
                  <Button variant="burgundy" className="h-10 rounded-[2px] px-4" disabled={busy} onClick={() => run("complete", {})}>
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCheck className="size-4" />} Mark as completed
                  </Button>
                )}
                {i.canCancel && (
                  <button type="button" onClick={() => setMode("cancel")} className="h-10 px-2 text-xs text-muted-grey hover:text-burgundy">
                    Cancel booking
                  </button>
                )}
              </m.div>
            ) : (
              <m.div key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                {mode === "accept" && (
                  <>
                    <label className="block">
                      <span className="text-xs text-muted-grey">Final price for this event</span>
                      <span className="mt-1 flex items-center border border-champagne focus-within:border-burgundy">
                        <span className="pl-3 text-muted-grey">₹</span>
                        <input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} className="h-10 w-full bg-transparent px-2 text-sm outline-none" aria-label="Final price" />
                      </span>
                    </label>
                    <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Note to the customer (optional): what's included, arrival time…" aria-label="Note to the customer" className="w-full border border-champagne px-3 py-2 text-sm outline-none focus:border-burgundy" />
                  </>
                )}
                {(mode === "decline" || mode === "cancel") && (
                  <>
                    {mode === "decline" && (
                      <div className="flex flex-wrap gap-1.5">
                        {DECLINE_REASONS.map((r) => (
                          <button key={r} type="button" onClick={() => setText(r)} className={cn("border px-2.5 py-1 text-xs", text === r ? "border-burgundy bg-burgundy text-ivory" : "border-champagne hover:border-burgundy")}>
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                    <textarea
                      rows={2}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      maxLength={500}
                      placeholder={mode === "decline" ? "Or write your own reason. The customer will see it." : "Why are you cancelling? The customer will see this."}
                      aria-label="Reason"
                      className="w-full border border-champagne px-3 py-2 text-sm outline-none focus:border-burgundy"
                    />
                  </>
                )}
                {error && <p className="text-xs text-burgundy">{error}</p>}
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => { setMode(null); setError(""); }} className="h-10 px-3 text-sm text-charcoal/70">
                    Back
                  </button>
                  <Button
                    variant="burgundy"
                    className={cn("h-10 rounded-[2px] px-5", mode === "accept" && "bg-emerald-700 hover:bg-emerald-800")}
                    disabled={busy}
                    onClick={() =>
                      mode === "accept"
                        ? run("accept", { price: price ? Number(price) : undefined, note: text || undefined })
                        : run(mode === "decline" ? "decline" : "cancel", { reason: text })
                    }
                  >
                    {busy && <Loader2 className="size-4 animate-spin" />}
                    {mode === "accept" ? `Confirm at ${formatINR(Number(price || 0))}` : mode === "decline" ? "Decline request" : "Cancel booking"}
                  </Button>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </article>
  );
}

function Fact({ icon: Icon, value }: { icon: typeof MapPin; value: string }) {
  return (
    <p className="flex items-start gap-2 text-charcoal/80">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-gold-deep" /> <span className="min-w-0">{value}</span>
    </p>
  );
}
