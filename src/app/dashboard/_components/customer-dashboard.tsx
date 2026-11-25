"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CalendarHeart, Loader2, MapPin, Search, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { clientApi } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import { BOOKING_ITEM_META, BOOKING_STATUS_META, daysUntil, formatINR } from "@/config/vendor";
import type { CustomerBooking, CustomerBookingList } from "@/types";

const SCOPES = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
] as const;
type Scope = (typeof SCOPES)[number]["id"];

type Load = { state: "loading" } | { state: "error"; message: string } | { state: "ready"; data: CustomerBookingList };

export function CustomerDashboard() {
  const { data: session, isPending } = useSession();
  const userId = session?.user.id;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const scope = (SCOPES.find((s) => s.id === params.get("scope"))?.id ?? "upcoming") as Scope;
  const [load, setLoad] = useState<Load>({ state: "loading" });

  useEffect(() => {
    if (!userId) return;
    const ctrl = new AbortController();
    clientApi<CustomerBookingList>(`/api/bookings?scope=${scope}`, { signal: ctrl.signal })
      .then((r) => setLoad(r.ok ? { state: "ready", data: r.data } : { state: "error", message: r.error }))
      .catch(() => {});
    return () => ctrl.abort();
  }, [userId, scope]);

  if (isPending) return <Spinner />;
  if (!session) {
    return (
      <div className="flex min-h-[70svh] items-center justify-center px-5 text-center">
        <div className="max-w-sm">
          <CalendarHeart className="mx-auto size-10 text-burgundy" strokeWidth={1.5} />
          <h1 className="mt-5 font-serif text-3xl text-charcoal">Sign in to see your bookings</h1>
          <Link href={`/login?next=${encodeURIComponent("/dashboard")}`} className={cn(buttonVariants({ variant: "burgundy", size: "xl" }), "mt-8")}>
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const first = session.user.name?.split(" ")[0];
  const counts = load.state === "ready" ? load.data.counts : null;

  return (
    <>
      <section className="grain relative overflow-hidden bg-burgundy text-ivory">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-gold/20 blur-[120px]" />
        <div className="shell relative flex flex-col gap-6 pt-12 md:flex-row md:items-end md:justify-between md:pt-16">
          <div>
            <p className="eyebrow text-gold">My bookings</p>
            <h1 className="mt-3 font-serif text-4xl md:text-5xl">{first ? <>Hello, <em className="text-champagne">{first}</em></> : "Your celebrations"}</h1>
            <p className="mt-2 text-champagne/75">Every event you&apos;re planning with us, in one place.</p>
          </div>
          <Link href="/search" className={cn(buttonVariants({ variant: "gold", size: "xl" }), "self-start md:self-auto")}>
            <Search className="size-4" /> Find vendors
          </Link>
        </div>
        <nav className="shell relative mt-10 flex gap-1" role="tablist" aria-label="Bookings">
          {SCOPES.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={s.id === scope}
              onClick={() => {
                setLoad({ state: "loading" });
                router.replace(s.id === "upcoming" ? pathname : `${pathname}?scope=${s.id}`, { scroll: false });
              }}
              className={cn("flex items-center gap-2 px-4 py-3.5 text-sm transition-colors", s.id === scope ? "bg-ivory text-burgundy" : "text-champagne/80 hover:text-ivory")}
            >
              {s.label}
              {counts && counts[s.id] > 0 && <span className="text-xs opacity-70">{counts[s.id]}</span>}
            </button>
          ))}
        </nav>
      </section>

      <div className="shell py-10 md:py-14">
        {load.state === "loading" && <Spinner inline />}
        {load.state === "error" && <p className="py-16 text-center text-sm text-burgundy">{load.message}</p>}
        {load.state === "ready" && load.data.bookings.length === 0 && <Empty scope={scope} />}
        {load.state === "ready" && load.data.bookings.length > 0 && (
          <ul className="grid gap-6 lg:grid-cols-2">
            {load.data.bookings.map((b) => (
              <li key={b.id}>
                <BookingCard booking={b} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function BookingCard({ booking: b }: { booking: CustomerBooking }) {
  const days = daysUntil(b.eventDate);
  const status = BOOKING_STATUS_META[b.status];
  const waiting = b.items.filter((i) => i.status === "PENDING" && !i.expired).length;
  const reviewable = b.items.filter((i) => i.canReview).length;

  return (
    <Link href={`/dashboard/bookings/${b.id}`} className="group block h-full border border-champagne bg-white transition-all duration-300 hover:border-gold-deep/50 hover:shadow-[0_24px_50px_-40px_rgba(101,30,45,0.6)]">
      <div className="flex items-start gap-5 border-b border-champagne/70 p-6">
        <div className="w-16 shrink-0 border border-gold/40 py-2 text-center">
          <p className="text-[0.65rem] uppercase tracking-wider text-gold-deep">{new Date(b.eventDate).toLocaleString("en-IN", { month: "short", timeZone: "UTC" })}</p>
          <p className="font-serif text-3xl leading-none text-charcoal">{new Date(b.eventDate).getUTCDate()}</p>
          <p className="text-[0.6rem] text-muted-grey">{new Date(b.eventDate).getUTCFullYear()}</p>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-2xl text-charcoal">{b.eventType}</h2>
            <span className={cn("border px-2 py-0.5 text-[0.7rem]", status.tone)}>{status.label}</span>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-grey">
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" /> {b.venue ? `${b.venue}, ` : ""}
              {b.city.name}
            </span>
            {b.guestCount && (
              <span className="flex items-center gap-1">
                <Users className="size-3.5" /> {b.guestCount} guests
              </span>
            )}
          </p>
          {days >= 0 && b.status !== "CANCELLED" && (
            <p className="mt-2 text-xs font-medium text-burgundy">{days === 0 ? "Today!" : days === 1 ? "Tomorrow" : `In ${days} days`}</p>
          )}
        </div>
      </div>
      <ul className="divide-y divide-champagne/50 px-6">
        {b.items.map((i) => {
          const meta = BOOKING_ITEM_META[i.expired ? "EXPIRED" : i.status];
          return (
            <li key={i.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="min-w-0">
                <span className="block truncate text-charcoal">{i.vendor.businessName}</span>
                <span className="block truncate text-xs text-muted-grey">{i.service.title}</span>
              </span>
              <span className={cn("inline-flex shrink-0 items-center gap-1.5 border px-2 py-0.5 text-[0.7rem]", meta.tone)}>
                <span className={cn("size-1.5 rounded-full", meta.dot)} /> {meta.customer}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between gap-3 px-6 py-4 text-sm">
        <span className="text-muted-grey">
          {reviewable > 0 ? (
            <span className="font-medium text-gold-deep">Leave {reviewable === 1 ? "a review" : `${reviewable} reviews`}</span>
          ) : waiting > 0 ? (
            `Waiting on ${waiting} vendor${waiting > 1 ? "s" : ""}`
          ) : (
            <>
              Total <span className="font-serif text-lg text-charcoal">{formatINR(b.totalAmount)}</span>
            </>
          )}
        </span>
        <ArrowRight className="size-4 text-muted-grey transition-transform group-hover:translate-x-1 group-hover:text-burgundy" />
      </div>
    </Link>
  );
}

function Empty({ scope }: { scope: Scope }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
      <CalendarHeart className="size-12 text-champagne" strokeWidth={1.25} />
      <h2 className="mt-5 font-serif text-3xl text-charcoal">
        {scope === "upcoming" ? "Nothing planned yet" : scope === "past" ? "No past events" : "No cancelled bookings"}
      </h2>
      {scope === "upcoming" && (
        <>
          <p className="mt-2 text-sm text-muted-grey">Find DJs, decorators, photographers and caterers near you, and request them for your date.</p>
          <Link href="/search" className={cn(buttonVariants({ variant: "burgundy", size: "xl" }), "mt-8")}>
            Start planning <ArrowRight className="size-4" />
          </Link>
        </>
      )}
    </div>
  );
}

function Spinner({ inline }: { inline?: boolean }) {
  return (
    <div className={cn("flex items-center justify-center", inline ? "py-24" : "min-h-[70svh]")} role="status">
      <Loader2 className="size-6 animate-spin text-gold-deep" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
