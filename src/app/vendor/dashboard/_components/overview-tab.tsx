"use client";

import { useState } from "react";
import { ArrowRight, CalendarDays, Check, Circle, Loader2, MessageSquareQuote, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { VISIBILITY_META, formatDate, formatINR, timeAgo } from "@/config/vendor";
import { useDashboard } from "./vendor-dashboard";

export function OverviewTab() {
  const { data, goTo } = useDashboard();
  const { stats } = data;

  const cards = [
    { label: "Live services", value: stats.liveServices, hint: stats.pendingServices ? `${stats.pendingServices} under review` : stats.pausedServices ? `${stats.pausedServices} paused` : "Customers can book these", tab: "services" as const },
    { label: "Booking requests", value: stats.bookingRequests, hint: stats.bookingRequests ? "Waiting for your reply" : "No new requests", tab: "bookings" as const },
    { label: "Confirmed bookings", value: stats.confirmedBookings, hint: `${stats.totalBookings} in total`, tab: "bookings" as const },
    {
      label: "Rating",
      value: stats.totalReviews ? stats.rating.toFixed(1) : "—",
      hint: stats.totalReviews ? `${stats.totalReviews} review${stats.totalReviews > 1 ? "s" : ""}` : "No reviews yet",
      icon: Star,
    },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-8">
        <VisibilityCard />

        <div className="grid grid-cols-2 gap-px border border-champagne bg-champagne md:grid-cols-4">
          {cards.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => c.tab && goTo(c.tab)}
              disabled={!c.tab}
              className="group bg-white p-5 text-left transition-colors enabled:hover:bg-ivory disabled:cursor-default"
            >
              <p className="text-xs text-muted-grey">{c.label}</p>
              <p className="mt-2 flex items-center gap-1.5 font-serif text-4xl text-charcoal">
                {c.value}
                {c.icon && stats.totalReviews > 0 && <c.icon className="size-5 fill-gold text-gold" />}
              </p>
              <p className="mt-1 text-xs text-muted-grey">{c.hint}</p>
            </button>
          ))}
        </div>

        <section className="border border-champagne bg-white p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-charcoal">Upcoming bookings</h2>
            <button type="button" onClick={() => goTo("bookings")} className="link-draw inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.16em] text-gold-deep">
              Manage <ArrowRight className="size-3.5" />
            </button>
          </div>
          {data.upcoming.length === 0 ? (
            <div className="mt-6 flex items-center gap-4 border border-dashed border-champagne p-6">
              <CalendarDays className="size-8 shrink-0 text-champagne" strokeWidth={1.25} />
              <p className="text-sm text-muted-grey">
                No upcoming bookings yet. A complete profile with great photos helps customers choose you.
              </p>
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-champagne/70">
              {data.upcoming.map((b) => (
                <li key={b.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 shrink-0 border border-champagne py-1.5 text-center">
                      <p className="text-[0.65rem] uppercase tracking-wider text-gold-deep">{new Date(b.booking.eventDate).toLocaleString("en-IN", { month: "short" })}</p>
                      <p className="font-serif text-2xl leading-none text-charcoal">{new Date(b.booking.eventDate).getDate()}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-charcoal">
                        {b.booking.eventType} · {b.service.title}
                      </p>
                      <p className="text-xs text-muted-grey">
                        {b.booking.customer.name} · {b.booking.city.name}
                        {b.booking.guestCount ? ` · ${b.booking.guestCount} guests` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:text-right">
                    <span className="text-sm tabular-nums text-charcoal">{formatINR(b.price)}</span>
                    <span className={cn("border px-2 py-0.5 text-[0.7rem]", b.status === "PENDING" ? "border-gold/50 bg-gold/10 text-gold-deep" : "border-emerald-700/25 bg-emerald-50 text-emerald-800")}>
                      {b.status === "PENDING" ? "Awaiting reply" : "Confirmed"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border border-champagne bg-white p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-charcoal">Recent activity</h2>
            <button type="button" onClick={() => goTo("activity")} className="link-draw inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.16em] text-gold-deep">
              See all <ArrowRight className="size-3.5" />
            </button>
          </div>
          <ul className="mt-5 space-y-3">
            {data.activity.slice(0, 5).map((a) => (
              <li key={a.id} className="flex items-baseline justify-between gap-4 text-sm">
                <span className="text-charcoal/85">
                  {a.summary}
                  {a.actor?.role === "admin" && <span className="text-xs text-muted-grey"> · our team</span>}
                </span>
                <span className="shrink-0 text-xs text-muted-grey">{timeAgo(a.createdAt)}</span>
              </li>
            ))}
            {data.activity.length === 0 && <li className="text-sm text-muted-grey">Changes you make will appear here.</li>}
          </ul>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="border border-champagne bg-white p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="eyebrow text-[0.6rem] text-gold-deep">Profile strength</h2>
            <span className="font-serif text-3xl text-charcoal">{data.completeness.percent}%</span>
          </div>
          <div className="mt-3 h-1.5 bg-sand">
            <div className="h-full bg-gradient-to-r from-burgundy to-gold transition-all duration-700" style={{ width: `${data.completeness.percent}%` }} />
          </div>
          <ul className="mt-5 space-y-2.5">
            {data.completeness.items.map((i) => (
              <li key={i.key} className={cn("flex items-start gap-2.5 text-sm", i.done ? "text-muted-grey line-through decoration-champagne" : "text-charcoal")}>
                {i.done ? <Check className="mt-0.5 size-4 shrink-0 text-emerald-700" /> : <Circle className="mt-0.5 size-4 shrink-0 text-champagne" />}
                {i.label}
              </li>
            ))}
          </ul>
          {data.completeness.percent < 100 && (
            <button type="button" onClick={() => goTo(data.completeness.items.find((i) => !i.done)?.key === "services" ? "services" : "profile")} className="link-draw mt-5 inline-flex items-center gap-1.5 text-sm text-burgundy">
              Improve your listing <ArrowRight className="size-3.5" />
            </button>
          )}
        </section>

        {data.notes.length > 0 && (
          <section className="border border-champagne bg-white p-6">
            <h2 className="eyebrow text-[0.6rem] text-gold-deep">From our team</h2>
            <ul className="mt-4 space-y-4">
              {data.notes.slice(0, 3).map((n) => (
                <li key={n.id} className="flex gap-3">
                  <MessageSquareQuote className="mt-0.5 size-4 shrink-0 text-gold-deep" />
                  <div>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-charcoal/85">{n.note}</p>
                    <p className="mt-1 text-xs text-muted-grey">{formatDate(n.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>
    </div>
  );
}

function VisibilityCard() {
  const { data, act, readOnly, goTo } = useDashboard();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const v = VISIBILITY_META[data.visibility];
  const paused = !data.profile.isActive;

  async function toggle() {
    setBusy(true);
    setError("");
    const res = await act("/listing", "PATCH", { isActive: paused }, paused ? "Your listing is visible again" : "Listing paused");
    setBusy(false);
    if (!res.ok) setError(res.error);
  }

  return (
    <section className={cn("flex flex-col gap-4 border p-6 sm:flex-row sm:items-center sm:justify-between", v.tone)}>
      <div className="flex items-start gap-3">
        <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", v.dot, data.visibility === "live" && "shadow-[0_0_0_4px_rgba(5,150,105,0.15)]")} />
        <div>
          <p className="font-medium">{data.visibility === "live" ? "Your listing is live" : v.label}</p>
          <p className="mt-0.5 text-sm opacity-80">{v.text}</p>
          {error && <p className="mt-1 text-sm text-burgundy">{error}</p>}
        </div>
      </div>
      {!readOnly &&
        (data.visibility === "no_services" ? (
          <button type="button" onClick={() => goTo("services")} className="inline-flex h-10 shrink-0 items-center gap-2 border border-current px-4 text-sm font-medium">
            Manage services <ArrowRight className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggle}
            disabled={busy}
            role="switch"
            aria-checked={!paused}
            className="inline-flex shrink-0 items-center gap-3 text-sm font-medium"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {paused ? "Paused" : "Accepting bookings"}
            <span className={cn("relative h-6 w-11 rounded-full transition-colors", paused ? "bg-charcoal/25" : "bg-emerald-600")}>
              <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", paused ? "left-0.5" : "left-[1.375rem]")} />
            </span>
          </button>
        ))}
    </section>
  );
}
