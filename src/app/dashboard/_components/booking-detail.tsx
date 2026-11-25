"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { ArrowLeft, CalendarDays, Loader2, MapPin, MessageCircle, Phone, Plus, Star, StickyNote, Users } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { clientApi } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import { BOOKING_ITEM_META, BOOKING_STATUS_META, daysUntil, formatDate, formatEventDate, formatINR, timeAgo } from "@/config/vendor";
import type { CustomerBookingDetail, CustomerBookingItem } from "@/types";

type Load = { state: "loading" } | { state: "error"; message: string } | { state: "ready"; data: CustomerBookingDetail };

export function BookingDetail({ id }: { id: string }) {
  const { data: session, isPending } = useSession();
  const userId = session?.user.id;
  const [load, setLoad] = useState<Load>({ state: "loading" });

  useEffect(() => {
    if (!userId) return;
    const ctrl = new AbortController();
    clientApi<CustomerBookingDetail>(`/api/bookings/${id}`, { signal: ctrl.signal })
      .then((r) => setLoad(r.ok ? { state: "ready", data: r.data } : { state: "error", message: r.error }))
      .catch(() => {});
    return () => ctrl.abort();
  }, [userId, id]);

  if (isPending || (session && load.state === "loading")) {
    return (
      <div className="flex min-h-[70svh] items-center justify-center" role="status">
        <Loader2 className="size-6 animate-spin text-gold-deep" />
      </div>
    );
  }
  if (!session) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        <Link href={`/login?next=${encodeURIComponent(`/dashboard/bookings/${id}`)}`} className={buttonVariants({ variant: "burgundy", size: "xl" })}>
          Sign in to view this booking
        </Link>
      </div>
    );
  }
  if (load.state === "error") {
    return (
      <div className="shell py-24 text-center">
        <p className="text-sm text-burgundy">{load.message}</p>
        <Link href="/dashboard" className="link-draw mt-4 inline-block text-sm text-charcoal">
          Back to my bookings
        </Link>
      </div>
    );
  }
  if (load.state !== "ready") return null;
  return <Detail booking={load.data} onChange={(data) => setLoad({ state: "ready", data })} />;
}

function Detail({ booking: b, onChange }: { booking: CustomerBookingDetail; onChange: (b: CustomerBookingDetail) => void }) {
  const days = daysUntil(b.eventDate);
  const status = BOOKING_STATUS_META[b.status];
  const cancellable = b.items.some((i) => i.canCancel);
  const [cancelAll, setCancelAll] = useState(false);

  return (
    <div className="shell py-10 md:py-14">
      <Link href="/dashboard" className="link-draw inline-flex items-center gap-2 text-sm text-charcoal/70 hover:text-burgundy">
        <ArrowLeft className="size-4" /> My bookings
      </Link>

      <header className="mt-6 flex flex-col gap-4 border-b border-champagne pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <span className={cn("inline-block border px-2.5 py-0.5 text-xs", status.tone)}>{status.label}</span>
          <h1 className="mt-3 font-serif text-4xl text-charcoal md:text-5xl">{b.eventType}</h1>
          <p className="mt-2 text-lg text-charcoal/75">{formatEventDate(b.eventDate)}</p>
          {days >= 0 && b.status !== "CANCELLED" && b.status !== "COMPLETED" && (
            <p className="mt-1 text-sm font-medium text-burgundy">{days === 0 ? "It's today. Enjoy every moment!" : days === 1 ? "Tomorrow" : `${days} days to go`}</p>
          )}
        </div>
        {b.canAddServices && (
          <Link href={`/search?city=${b.city.slug}`} className={cn(buttonVariants({ variant: "outline-dark", size: "xl" }), "self-start md:self-auto")}>
            <Plus className="size-4" /> Add another vendor
          </Link>
        )}
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-5">
          <h2 className="eyebrow text-[0.6rem] text-gold-deep">Vendors for this event</h2>
          {b.items.map((i) => (
            <VendorItem key={i.id} bookingId={b.id} item={i} onChange={onChange} />
          ))}
        </div>

        <aside className="space-y-6">
          <section className="border border-champagne bg-white p-6">
            <h2 className="eyebrow text-[0.6rem] text-gold-deep">Event details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row icon={CalendarDays} value={formatEventDate(b.eventDate)} />
              <Row icon={MapPin} value={[b.venue, `${b.city.name}, ${b.city.state}`].filter(Boolean).join(", ")} />
              {b.guestCount && <Row icon={Users} value={`${b.guestCount} guests`} />}
              {b.contactPhone && <Row icon={Phone} value={`+91 ${b.contactPhone}`} />}
              {b.notes && <Row icon={StickyNote} value={b.notes} />}
            </dl>
            <div className="mt-5 flex items-baseline justify-between border-t border-champagne/70 pt-4">
              <span className="text-sm text-muted-grey">Total</span>
              <span className="font-serif text-3xl text-charcoal">{formatINR(b.totalAmount)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-grey">Confirmed vendors at their agreed price, plus pending requests at the listed price.</p>
          </section>

          <section className="border border-champagne bg-white p-6">
            <h2 className="eyebrow text-[0.6rem] text-gold-deep">Timeline</h2>
            <ol className="mt-4 space-y-4">
              {b.events.map((e) => (
                <li key={e.id} className="relative pl-5 text-sm">
                  <span className="absolute left-0 top-1.5 size-2 rounded-full bg-gold" />
                  <p className="text-charcoal/85">{e.message}</p>
                  <p className="text-xs text-muted-grey">{timeAgo(e.createdAt)}</p>
                </li>
              ))}
            </ol>
          </section>

          {cancellable &&
            (cancelAll ? (
              <CancelBox
                label="Cancel the whole booking?"
                hint="Every vendor will be told. This can't be undone."
                endpoint={`/api/bookings/${b.id}/cancel`}
                onDone={onChange}
                onClose={() => setCancelAll(false)}
              />
            ) : (
              <button type="button" onClick={() => setCancelAll(true)} className="link-draw text-sm text-burgundy">
                Cancel this booking
              </button>
            ))}
        </aside>
      </div>
    </div>
  );
}

function Row({ icon: Icon, value }: { icon: typeof MapPin; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-gold-deep" />
      <span className="whitespace-pre-line text-charcoal/85">{value}</span>
    </div>
  );
}

function VendorItem({ bookingId, item: i, onChange }: { bookingId: string; item: CustomerBookingItem; onChange: (b: CustomerBookingDetail) => void }) {
  const meta = BOOKING_ITEM_META[i.expired ? "EXPIRED" : i.status];
  const [cancelling, setCancelling] = useState(false);
  const priceChanged = i.listedPrice != null && i.listedPrice !== i.price;

  return (
    <article className="border border-champagne bg-white">
      <div className="flex items-start gap-4 p-5 sm:p-6">
        <Link href={`/vendors/${i.vendor.slug}`} className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-burgundy font-serif text-xl text-champagne">
          {i.vendor.profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- vendor-supplied link
            <img src={i.vendor.profileImage} alt="" className="size-full object-cover" />
          ) : (
            i.vendor.businessName[0]
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={`/vendors/${i.vendor.slug}`} className="link-draw font-medium text-charcoal hover:text-burgundy">
                {i.vendor.businessName}
              </Link>
              <p className="text-sm text-muted-grey">
                {i.service.title} · {i.service.category.name}
              </p>
            </div>
            <span className={cn("inline-flex shrink-0 items-center gap-1.5 border px-2 py-0.5 text-[0.7rem]", meta.tone)}>
              <span className={cn("size-1.5 rounded-full", meta.dot)} /> {meta.customer}
            </span>
          </div>

          <p className="mt-2 text-sm tabular-nums text-charcoal">
            {formatINR(i.price)}
            {priceChanged && <span className="ml-2 text-xs text-muted-grey line-through">{formatINR(i.listedPrice!)}</span>}
            {i.status === "PENDING" && <span className="ml-2 text-xs text-muted-grey">listed price, to be confirmed</span>}
          </p>

          {i.status === "PENDING" && !i.expired && <p className="mt-2 text-xs text-muted-grey">Sent {timeAgo(i.createdAt)}. Most vendors reply within a day.</p>}
          {i.expired && <p className="mt-2 text-xs text-muted-grey">The vendor didn&apos;t reply before the event date.</p>}
          {i.vendorNote && <Quote tone="gold">{i.vendorNote}</Quote>}
          {i.declineReason && <Quote tone="burgundy">{i.declineReason}</Quote>}
          {i.cancelReason && (
            <Quote tone="burgundy">
              {i.cancelledBy === "vendor" ? "Vendor: " : "Your reason: "}
              {i.cancelReason}
            </Quote>
          )}

          {i.vendor.contact && (i.vendor.contact.phone || i.vendor.contact.whatsapp) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {i.vendor.contact.phone && (
                <a href={`tel:+91${i.vendor.contact.phone}`} className="inline-flex h-9 items-center gap-2 border border-champagne px-3 text-xs font-medium text-charcoal hover:border-burgundy hover:text-burgundy">
                  <Phone className="size-3.5" /> +91 {i.vendor.contact.phone}
                </a>
              )}
              {i.vendor.contact.whatsapp && (
                <a href={`https://wa.me/91${i.vendor.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 bg-emerald-700 px-3 text-xs font-medium text-white hover:bg-emerald-800">
                  <MessageCircle className="size-3.5" /> WhatsApp
                </a>
              )}
            </div>
          )}

          {i.status === "REJECTED" && (
            <Link href={`/search${i.service.category.slug ? `?category=${i.service.category.slug}` : ""}`} className="link-draw mt-3 inline-block text-sm text-burgundy">
              Find another {i.service.category.name.toLowerCase()} vendor
            </Link>
          )}

          {i.review && (
            <div className="mt-4 bg-sand/60 p-4">
              <Stars value={i.review.rating} />
              {i.review.comment && <p className="mt-2 text-sm text-charcoal/80">“{i.review.comment}”</p>}
              <p className="mt-1 text-xs text-muted-grey">Your review · {formatDate(i.review.createdAt)}</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {i.canReview && <ReviewForm key="review" bookingId={bookingId} item={i} onChange={onChange} />}
      </AnimatePresence>

      {i.canCancel && (
        <div className="border-t border-champagne/70 px-5 py-3 sm:px-6">
          {cancelling ? (
            <CancelBox
              label={`Cancel ${i.vendor.businessName}?`}
              hint={i.status === "ACCEPTED" ? "They've already confirmed, so please tell them why." : "Your request will be withdrawn."}
              endpoint={`/api/bookings/${bookingId}/items/${i.id}/cancel`}
              onDone={onChange}
              onClose={() => setCancelling(false)}
            />
          ) : (
            <button type="button" onClick={() => setCancelling(true)} className="text-xs text-muted-grey hover:text-burgundy">
              {i.status === "PENDING" ? "Withdraw request" : "Cancel this vendor"}
            </button>
          )}
        </div>
      )}
    </article>
  );
}

function Quote({ tone, children }: { tone: "gold" | "burgundy"; children: React.ReactNode }) {
  return <p className={cn("mt-3 border-l-2 pl-3 text-sm leading-relaxed", tone === "gold" ? "border-gold text-charcoal/80" : "border-burgundy/50 text-burgundy")}>{children}</p>;
}

function Stars({ value, onPick }: { value: number; onPick?: (n: number) => void }) {
  return (
    <div className="flex gap-1" role={onPick ? "radiogroup" : undefined} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) =>
        onPick ? (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => onPick(n)} className="transition-transform hover:scale-110">
            <Star className={cn("size-7", n <= value ? "fill-gold text-gold" : "text-champagne")} />
          </button>
        ) : (
          <Star key={n} className={cn("size-4", n <= value ? "fill-gold text-gold" : "text-champagne")} />
        )
      )}
    </div>
  );
}

function ReviewForm({ bookingId, item, onChange }: { bookingId: string; item: CustomerBookingItem; onChange: (b: CustomerBookingDetail) => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return setError("Choose a star rating");
    setBusy(true);
    const r = await clientApi<CustomerBookingDetail>(`/api/bookings/${bookingId}/items/${item.id}/review`, { method: "POST", body: { rating, comment } });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    onChange(r.data);
  }

  return (
    <m.form onSubmit={submit} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-gold/30 bg-gradient-to-b from-gold/[0.07] to-transparent">
      <div className="p-5 sm:p-6">
        <p className="font-serif text-xl text-charcoal">How was {item.vendor.businessName}?</p>
        <div className="mt-3">
          <Stars value={rating} onPick={(n) => { setRating(n); setError(""); }} />
        </div>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1500}
          placeholder="What stood out? Your words help other families choose."
          aria-label="Your review"
          className="mt-4 w-full resize-y border border-champagne bg-white px-3 py-2.5 text-sm outline-none focus:border-burgundy"
        />
        {error && <p className="mt-1 text-xs text-burgundy">{error}</p>}
        <Button type="submit" variant="burgundy" className="mt-3 h-10 rounded-[2px] px-5" disabled={busy}>
          {busy && <Loader2 className="size-4 animate-spin" />} Post review
        </Button>
      </div>
    </m.form>
  );
}

function CancelBox({ label, hint, endpoint, onDone, onClose }: { label: string; hint: string; endpoint: string; onDone: (b: CustomerBookingDetail) => void; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    setBusy(true);
    const r = await clientApi<CustomerBookingDetail>(endpoint, { method: "POST", body: { reason } });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    onDone(r.data);
    onClose();
  }

  return (
    <div className="border border-burgundy/25 bg-burgundy/[0.03] p-4">
      <p className="text-sm font-medium text-burgundy">{label}</p>
      <p className="mt-0.5 text-xs text-muted-grey">{hint}</p>
      <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} placeholder="Reason (optional)" aria-label="Reason for cancelling" className="mt-3 w-full border border-champagne bg-white px-3 py-2 text-sm outline-none focus:border-burgundy" />
      {error && <p className="mt-1 text-xs text-burgundy">{error}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="h-9 px-3 text-xs text-charcoal/70">
          Keep it
        </button>
        <Button variant="burgundy" className="h-9 rounded-[2px] px-4 text-xs" disabled={busy} onClick={confirm}>
          {busy && <Loader2 className="size-3.5 animate-spin" />} Yes, cancel
        </Button>
      </div>
    </div>
  );
}
