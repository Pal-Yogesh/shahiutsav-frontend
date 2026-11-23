"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Clock, PauseCircle, Sparkles, XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STATUS_META, formatDate, formatINR } from "@/config/vendor";
import type { VendorApplicationDTO, VendorStatus } from "@/types";

const EASE = [0.22, 1, 0.36, 1] as const;

const JOURNEY = [
  { label: "Application sent", caption: "You told us about your business" },
  { label: "Team review", caption: "We check your details and work" },
  { label: "Live on ShahiUtsav", caption: "Customers can find and book you" },
];

// Index of the current journey step; 3 means every step is done
function journeyStage(status: VendorStatus) {
  return status === "APPROVED" || status === "SUSPENDED" ? 3 : 1;
}

const COPY: Partial<Record<VendorStatus, { icon: typeof Clock; title: string; text: string }>> = {
  SUBMITTED: {
    icon: Clock,
    title: "Your application is with our team",
    text: "We're reviewing your details, services and photos. We'll email you as soon as there's an update. There's nothing more you need to do right now.",
  },
  APPROVED: {
    icon: Sparkles,
    title: "You're live!",
    text: "Customers can now find you in search under each service you offer, and send you enquiries and bookings.",
  },
  REJECTED: {
    icon: XCircle,
    title: "We couldn't approve this application",
    text: "Thank you for your interest. You'll find the reason from our team below. If your situation changes, reply to our email and we can take another look.",
  },
  SUSPENDED: {
    icon: PauseCircle,
    title: "Your listing is paused",
    text: "Your profile is hidden from customers for now. See the note from our team below, and reply to our email to resolve it.",
  },
};

export function ApplicationStatus({ app }: { app: VendorApplicationDTO }) {
  const reduce = useReducedMotion();
  const copy = COPY[app.status] ?? COPY.SUBMITTED!;
  const Icon = copy.icon;
  const stage = journeyStage(app.status);
  const negative = app.status === "REJECTED" || app.status === "SUSPENDED";
  const notes = app.events.filter((e) => e.note);

  return (
    <div className="mx-auto max-w-3xl">
      <m.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative overflow-hidden border border-champagne bg-white p-8 text-center shadow-[0_30px_60px_-45px_rgba(25,22,25,0.45)] sm:p-12"
      >
        <div aria-hidden className="pointer-events-none absolute inset-3 border border-gold/25" />
        <span
          className={cn(
            "mx-auto flex size-16 items-center justify-center rounded-full",
            negative ? "bg-burgundy/[0.07] text-burgundy" : app.status === "APPROVED" ? "bg-gold/15 text-gold-deep" : "bg-sand text-burgundy"
          )}
        >
          <Icon className="size-7" strokeWidth={1.5} />
        </span>
        <span className={cn("mt-6 inline-flex items-center gap-2 border px-3 py-1 text-xs font-medium", STATUS_META[app.status].tone)}>
          <span className={cn("size-1.5 rounded-full", STATUS_META[app.status].dot)} />
          {STATUS_META[app.status].label}
        </span>
        <h2 className="mt-4 font-serif text-3xl text-charcoal sm:text-4xl">{copy.title}</h2>
        <p className="mx-auto mt-4 max-w-lg text-[0.95rem] leading-relaxed text-muted-grey">{copy.text}</p>

        {app.status === "APPROVED" && (
          <Link href={`/vendors/${app.slug}`} className={cn(buttonVariants({ variant: "burgundy", size: "xl" }), "mt-8")}>
            See your listing <ArrowRight className="size-4" />
          </Link>
        )}

        {/* Journey */}
        {!negative && (
          <ol className="mt-12 grid gap-6 text-left sm:grid-cols-3 sm:gap-4">
            {JOURNEY.map((j, i) => {
              const done = i < stage || (i === 2 && stage === 3);
              const current = i === stage && stage < 3;
              return (
                <li key={j.label} className="relative">
                  {i < JOURNEY.length - 1 && <span aria-hidden className={cn("absolute left-4 top-4 hidden h-px w-full sm:block", done ? "bg-gold" : "bg-champagne")} />}
                  <span
                    className={cn(
                      "relative flex size-8 items-center justify-center rounded-full border text-xs font-semibold",
                      done ? "border-gold bg-gold text-charcoal" : current ? "border-burgundy bg-white text-burgundy" : "border-champagne bg-white text-muted-grey"
                    )}
                  >
                    {done ? <Check className="size-4" strokeWidth={2.5} /> : i + 1}
                    {current && !reduce && <span className="absolute inset-0 animate-ping rounded-full border border-burgundy/40" />}
                  </span>
                  <p className="mt-3 text-sm font-medium text-charcoal">{j.label}</p>
                  <p className="text-xs text-muted-grey">{j.caption}</p>
                </li>
              );
            })}
          </ol>
        )}
      </m.div>

      {notes.length > 0 && (
        <section className="mt-8 border border-champagne bg-white p-6 sm:p-8">
          <h3 className="eyebrow text-[0.6rem] text-gold-deep">Notes from our team</h3>
          <ul className="mt-4 space-y-4">
            {notes.map((e) => (
              <li key={e.id} className="border-l-2 border-gold pl-4">
                <p className="whitespace-pre-line text-sm leading-relaxed text-charcoal">{e.note}</p>
                <p className="mt-1 text-xs text-muted-grey">
                  {STATUS_META[e.toStatus].label} · {formatDate(e.createdAt, true)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 grid gap-6 border border-champagne bg-white p-6 sm:grid-cols-2 sm:p-8">
        <div>
          <h3 className="eyebrow text-[0.6rem] text-gold-deep">Business</h3>
          <p className="mt-3 font-serif text-2xl text-charcoal">{app.businessName}</p>
          <p className="mt-1 text-sm text-muted-grey">
            {app.city.name}, {app.city.state}
          </p>
          {app.submittedAt && <p className="mt-3 text-xs text-muted-grey">Submitted {formatDate(app.submittedAt)}</p>}
        </div>
        <div>
          <h3 className="eyebrow text-[0.6rem] text-gold-deep">Services</h3>
          <ul className="mt-3 space-y-2">
            {app.services.map((s) => (
              <li key={s.id} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-charcoal">
                  {s.title} <span className="text-xs text-muted-grey">· {s.category.name}</span>
                </span>
                <span className="shrink-0 tabular-nums text-gold-deep">{formatINR(s.price)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {app.status === "APPROVED" && (
        <p className="mt-6 text-center text-xs text-muted-grey">Need to change your details or prices? Reply to your approval email and our team will update your listing.</p>
      )}
    </div>
  );
}
