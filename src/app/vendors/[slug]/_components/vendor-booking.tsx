"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import { ArrowRight, CalendarCheck, Check, Loader2, Lock, PartyPopper, ShieldCheck } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { SelectField, TextArea, TextField } from "@/components/forms/fields";
import { useSession } from "@/lib/auth-client";
import { clientApi } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import { EVENT_TYPES } from "@/config/constants";
import { PRICE_TYPES, formatEventDate, formatINR, localDateKey } from "@/config/vendor";
import type { CityDTO, CustomerBookingDetail, OpenEvent, ServiceDTO } from "@/types";

type Vendor = { id: string; slug: string; businessName: string; cityId: string; cityName: string };

type Form = {
  target: string; // "new" or an existing booking id
  eventType: string;
  eventDate: string;
  cityId: string;
  guestCount: string;
  venue: string;
  contactPhone: string;
  notes: string;
};

function priceLabel(s: ServiceDTO) {
  const suffix = PRICE_TYPES.find((p) => p.value === s.priceType)?.suffix;
  return s.priceType === "STARTING_FROM" ? `from ${formatINR(s.price)}` : `${formatINR(s.price)} ${suffix}`;
}

export function VendorBooking({
  vendor,
  services,
  cities,
  before,
  after,
}: {
  vendor: Vendor;
  services: ServiceDTO[];
  cities: CityDTO[];
  before: React.ReactNode;
  after: React.ReactNode;
}) {
  const params = useSearchParams();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  // ?select= keeps the chosen services across the sign-in round trip
  const [selected, setSelected] = useState<Set<string>>(() => {
    const ids = (params.get("select") ?? "").split(",").filter((id) => services.some((s) => s.id === id));
    return new Set(ids);
  });
  const [form, setForm] = useState<Form>({ target: "new", eventType: "", eventDate: "", cityId: vendor.cityId, guestCount: "", venue: "", contactPhone: "", notes: "" });
  const [openEvents, setOpenEvents] = useState<OpenEvent[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<CustomerBookingDetail | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelVisible, setPanelVisible] = useState(false);

  const chosen = useMemo(() => services.filter((s) => selected.has(s.id)), [services, selected]);
  const estimate = chosen.reduce((sum, s) => sum + s.price, 0);
  const existing = openEvents.find((e) => e.id === form.target);

  useEffect(() => {
    if (!session) return;
    const ctrl = new AbortController();
    clientApi<OpenEvent[]>("/api/bookings/open-events", { signal: ctrl.signal })
      .then((r) => r.ok && setOpenEvents(r.data))
      .catch(() => {});
    return () => ctrl.abort();
  }, [session]);

  // Phones: a summary bar while the booking panel is off screen
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setPanelVisible(e.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setBanner("");
  }

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!chosen.length) return setBanner("Choose at least one service above.");
    const isNew = form.target === "new";
    const local: Record<string, string> = {};
    if (isNew) {
      if (!form.eventType) local.eventType = "Choose the occasion";
      if (!form.eventDate) local.eventDate = "Choose the event date";
      if (!/^[6-9]\d{9}$/.test(form.contactPhone.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, ""))) local.contactPhone = "Enter a 10-digit mobile number";
    }
    if (Object.keys(local).length) return setErrors(local);

    setBusy(true);
    setBanner("");
    const res = await clientApi<CustomerBookingDetail>("/api/bookings", {
      method: "POST",
      body: {
        ...(isNew
          ? {
              eventType: form.eventType,
              eventDate: form.eventDate,
              cityId: form.cityId,
              guestCount: form.guestCount ? Number(form.guestCount) : null,
              venue: form.venue || null,
              contactPhone: form.contactPhone,
              notes: form.notes || null,
            }
          : { bookingId: form.target }),
        items: chosen.map((s) => ({ serviceId: s.id, ...(form.notes && !isNew ? { notes: form.notes } : {}) })),
      },
    });
    setBusy(false);
    if (!res.ok) {
      setErrors(res.fieldErrors);
      return setBanner(res.error);
    }
    setDone(res.data);
    setSelected(new Set());
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const signInHref = `/login?next=${encodeURIComponent(`${pathname}${selected.size ? `?select=${[...selected].join(",")}` : ""}`)}`;

  return (
    <div className="grid gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-14 lg:py-14">
      <div className="min-w-0 space-y-14">
        {before}

        <section id="services" className="scroll-mt-28">
          <h2 className="font-serif text-3xl text-charcoal">Services</h2>
          <p className="mt-1 text-sm text-muted-grey">Choose one or more to request. The vendor confirms availability and the final price.</p>
          <ul className="mt-5 space-y-3">
            {services.map((s) => {
              const on = selected.has(s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => toggle(s.id)}
                    aria-pressed={on}
                    className={cn(
                      "group flex w-full items-start gap-4 border p-5 text-left transition-all duration-300",
                      on ? "border-burgundy bg-white shadow-[0_18px_40px_-30px_rgba(101,30,45,0.6)]" : "border-champagne bg-white/60 hover:border-gold-deep/50 hover:bg-white"
                    )}
                  >
                    <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center border transition-colors", on ? "border-burgundy bg-burgundy text-ivory" : "border-champagne bg-white group-hover:border-gold-deep")}>
                      {on && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <span className="font-medium text-charcoal">{s.title}</span>
                        <span className="text-sm tabular-nums text-gold-deep">{priceLabel(s)}</span>
                      </span>
                      <span className="mt-0.5 block text-xs uppercase tracking-wider text-muted-grey">{s.category.name}</span>
                      {s.description && <span className="mt-2 block text-sm leading-relaxed text-charcoal/70">{s.description}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {after}
      </div>

      {/* Booking panel */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div ref={panelRef} id="book" className="scroll-mt-28 border border-champagne bg-white shadow-[0_30px_60px_-45px_rgba(25,22,25,0.5)]">
          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <m.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-7 text-center">
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-gold/15 text-gold-deep">
                  <PartyPopper className="size-6" strokeWidth={1.5} />
                </span>
                <h3 className="mt-5 font-serif text-3xl text-charcoal">Request sent</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-grey">
                  {vendor.businessName} will confirm availability for <strong className="font-medium text-charcoal">{formatEventDate(done.eventDate)}</strong>. We&apos;ll email you as soon as they reply.
                </p>
                <Link href={`/dashboard/bookings/${done.id}`} className={cn(buttonVariants({ variant: "burgundy", size: "xl" }), "mt-6 w-full")}>
                  View booking <ArrowRight className="size-4" />
                </Link>
                <Link href={`/search?city=${done.city.slug}`} className="link-draw mt-4 inline-block text-sm text-burgundy">
                  Find more vendors for this event
                </Link>
              </m.div>
            ) : (
              <m.form key="form" onSubmit={submit} initial={false} className="p-6">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-serif text-2xl text-charcoal">Request to book</h3>
                  {chosen.length > 0 && <span className="text-xs text-muted-grey">{chosen.length} selected</span>}
                </div>

                {chosen.length === 0 ? (
                  <p className="mt-4 border border-dashed border-champagne p-4 text-sm text-muted-grey">
                    Choose the services you&apos;d like from the list.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-2 border-b border-champagne/70 pb-4">
                    {chosen.map((s) => (
                      <li key={s.id} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="text-charcoal">{s.title}</span>
                        <span className="shrink-0 tabular-nums text-charcoal/70">{priceLabel(s)}</span>
                      </li>
                    ))}
                    <li className="flex items-baseline justify-between pt-2 text-sm">
                      <span className="text-muted-grey">Estimated</span>
                      <span className="font-serif text-2xl text-charcoal">{formatINR(estimate)}</span>
                    </li>
                  </ul>
                )}

                {isPending ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="size-5 animate-spin text-gold-deep" />
                  </div>
                ) : !session ? (
                  <div className="mt-5">
                    <Link href={signInHref} className={cn(buttonVariants({ variant: "burgundy", size: "xl" }), "w-full")}>
                      <Lock className="size-4" /> Sign in to request
                    </Link>
                    <p className="mt-3 text-center text-xs text-muted-grey">Takes a moment with an email code. Your selection is kept.</p>
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">
                    {openEvents.length > 0 && (
                      <SelectField
                        label="Add to"
                        value={form.target}
                        onChange={(e) => set("target", e.target.value)}
                        options={[
                          { value: "new", label: "A new event" },
                          ...openEvents.map((ev) => ({ value: ev.id, label: `${ev.eventType}, ${formatEventDate(ev.eventDate, "short")} (${ev.city.name})` })),
                        ]}
                      />
                    )}

                    {existing ? (
                      <p className="flex items-start gap-2 bg-sand/70 px-3 py-2.5 text-xs leading-relaxed text-charcoal/80">
                        <CalendarCheck className="mt-0.5 size-4 shrink-0 text-gold-deep" />
                        Adds {vendor.businessName} to your {existing.eventType.toLowerCase()} on {formatEventDate(existing.eventDate)}, with the same venue and contact details.
                      </p>
                    ) : (
                      <>
                        <SelectField label="Occasion" placeholder="Choose" value={form.eventType} onChange={(e) => set("eventType", e.target.value)} error={errors.eventType} options={EVENT_TYPES.map((t) => ({ value: t, label: t }))} />
                        <div className="grid grid-cols-2 gap-3">
                          <TextField label="Date" type="date" min={localDateKey(1)} max={localDateKey(730)} value={form.eventDate} onChange={(e) => set("eventDate", e.target.value)} error={errors.eventDate} />
                          <TextField label="Guests" optional inputMode="numeric" placeholder="200" value={form.guestCount} onChange={(e) => set("guestCount", e.target.value.replace(/\D/g, ""))} error={errors.guestCount} />
                        </div>
                        <SelectField label="City" value={form.cityId} onChange={(e) => set("cityId", e.target.value)} error={errors.cityId} options={cities.map((c) => ({ value: c.id, label: c.name }))} />
                        <TextField label="Venue" optional placeholder="Hotel, lawn or address" value={form.venue} onChange={(e) => set("venue", e.target.value)} error={errors.venue} />
                        <TextField label="Your mobile" prefix="+91" inputMode="numeric" placeholder="98765 43210" value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} error={errors.contactPhone} hint="Shared with the vendor once they confirm" />
                      </>
                    )}
                    <TextArea label={existing ? "Note to the vendor" : "Anything the vendor should know"} optional rows={3} placeholder="Timings, theme, music taste…" value={form.notes} onChange={(e) => set("notes", e.target.value)} maxLength={500} />

                    {banner && (
                      <p role="alert" className="text-sm text-burgundy">
                        {banner}
                      </p>
                    )}
                    <Button type="submit" variant="burgundy" size="xl" className="w-full" disabled={busy || chosen.length === 0}>
                      {busy && <Loader2 className="size-4 animate-spin" />} Send request
                    </Button>
                    <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-grey">
                      <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-700" />
                      No payment now. The vendor confirms availability and price first, and you can cancel any time before the event.
                    </p>
                  </div>
                )}
              </m.form>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Phones: summary bar while the panel is off screen */}
      <AnimatePresence>
        {chosen.length > 0 && !panelVisible && !done && (
          <m.div
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-gold/30 bg-black-cherry/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-ivory backdrop-blur-md lg:hidden"
          >
            <div>
              <p className="text-xs text-champagne/70">{chosen.length} selected</p>
              <p className="font-serif text-xl">{formatINR(estimate)}</p>
            </div>
            <a href="#book" className="flex h-11 items-center gap-2 bg-gold px-5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-charcoal">
              Continue <ArrowRight className="size-3.5" />
            </a>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
