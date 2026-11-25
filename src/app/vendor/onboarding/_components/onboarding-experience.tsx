"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { m, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, CalendarCheck, ClipboardList, IndianRupee, Loader2, MapPin, ShieldCheck, Store, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { clientApi } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import { STATUS_META } from "@/config/vendor";
import type { CategoryDTO, CityDTO, VendorApplicationDTO } from "@/types";
import { ApplicationWizard } from "./application-wizard";
import { ApplicationStatus } from "./application-status";

const EASE = [0.22, 1, 0.36, 1] as const;
const NEXT = encodeURIComponent("/vendor/onboarding");

type Load = { state: "loading" } | { state: "error"; message: string } | { state: "ready"; app: VendorApplicationDTO | null };

export function OnboardingExperience({ categories, cities }: { categories: CategoryDTO[]; cities: CityDTO[] }) {
  const { data: session, isPending } = useSession();
  const userId = session?.user.id;
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const ctrl = new AbortController();
    clientApi<VendorApplicationDTO | null>("/api/vendor-application", { signal: ctrl.signal })
      .then((res) => setLoad(res.ok ? { state: "ready", app: res.data } : { state: "error", message: res.error }))
      .catch(() => {});
    return () => ctrl.abort();
  }, [userId, attempt]);

  const onChange = useCallback((app: VendorApplicationDTO) => setLoad({ state: "ready", app }), []);

  // Approved partners manage everything from their dashboard
  const router = useRouter();
  const live = load.state === "ready" && (load.app?.status === "APPROVED" || load.app?.status === "SUSPENDED");
  useEffect(() => {
    if (live) router.replace("/vendor/dashboard");
  }, [live, router]);

  if (isPending || live) return <Shell><Loading /></Shell>;
  if (!session) return <PartnerIntro />;

  const app = load.state === "ready" ? load.app : null;
  const heading = !app
    ? { eyebrow: "Partner application", title: <>Let&apos;s get your business <em className="text-champagne">listed.</em></>, text: "Four short steps. Most partners finish in about ten minutes." }
    : app.canEdit
      ? { eyebrow: STATUS_META[app.status].label, title: <>{app.businessName}</>, text: app.status === "CHANGES_REQUESTED" ? "Update the details our team asked about, then resubmit." : "Pick up where you left off. Everything you've saved is here." }
      : { eyebrow: "Partner application", title: <>{app.businessName}</>, text: `${app.city.name}, ${app.city.state}` };

  return (
    <Shell eyebrow={heading.eyebrow} title={heading.title} text={heading.text}>
      {load.state === "loading" && <Loading />}
      {load.state === "error" && (
        <div className="mx-auto max-w-md border border-champagne bg-white p-8 text-center">
          <p className="text-sm text-burgundy">{load.message}</p>
          <button
            type="button"
            onClick={() => {
              setLoad({ state: "loading" });
              setAttempt((a) => a + 1);
            }}
            className={cn(buttonVariants({ variant: "outline-dark", size: "xl" }), "mt-6")}
          >
            Try again
          </button>
        </div>
      )}
      {load.state === "ready" &&
        (app && !app.canEdit ? (
          <ApplicationStatus app={app} />
        ) : (
          <ApplicationWizard initial={app} userName={session.user.name ?? ""} categories={categories} cities={cities} onChange={onChange} />
        ))}
    </Shell>
  );
}

function Loading() {
  return (
    <div className="flex min-h-80 items-center justify-center" role="status">
      <Loader2 className="size-6 animate-spin text-gold-deep" />
      <span className="sr-only">Loading your application</span>
    </div>
  );
}

function Shell({ eyebrow, title, text, children }: { eyebrow?: string; title?: React.ReactNode; text?: string; children: React.ReactNode }) {
  return (
    <div className="bg-ivory">
      <section className="grain relative overflow-hidden bg-burgundy text-ivory">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-gold/20 blur-[120px]" />
        <div className="shell relative py-12 md:py-16">
          {eyebrow && <p className="eyebrow text-gold">{eyebrow}</p>}
          {title && <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.05] md:text-5xl">{title}</h1>}
          {text && <p className="mt-4 max-w-xl text-champagne/80">{text}</p>}
        </div>
      </section>
      <div className="shell py-12 md:py-16">{children}</div>
    </div>
  );
}

// ─── Signed-out landing ──────────────────────────────────────────────

const BENEFITS = [
  { icon: Users, title: "Customers who are ready to book", text: "Reach people planning weddings, parties and corporate events in your city." },
  { icon: IndianRupee, title: "Free to join", text: "No listing fee for early partners. You set your own packages and prices." },
  { icon: BadgeCheck, title: "A verified badge", text: "Every partner is reviewed, so customers trust who they're booking." },
  { icon: CalendarCheck, title: "Enquiries in one place", text: "Manage enquiries and bookings without juggling calls and chats." },
];

const PROCESS = [
  { icon: ClipboardList, title: "Apply in 10 minutes", text: "Tell us about your business, services, prices and best work." },
  { icon: ShieldCheck, title: "We review it", text: "Our team checks your details and may ask for a few changes." },
  { icon: Store, title: "Go live", text: "Once approved, you appear in search for every service you offer." },
];

const NEEDED = ["Business name, city and address", "A mobile number for enquiries", "Your services with starting prices", "Links to a few photos of your work"];

function PartnerIntro() {
  const reduce = useReducedMotion();
  const fade = (i: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-10%" }, transition: { duration: 0.7, delay: i * 0.08, ease: EASE } };

  return (
    <div className="bg-ivory">
      <section className="grain relative overflow-hidden bg-burgundy text-ivory">
        <div aria-hidden className="pointer-events-none absolute -left-32 -top-32 size-[28rem] rounded-full bg-gold/20 blur-[140px]" />
        <div className="shell relative grid gap-12 py-16 md:py-24 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <m.p {...fade(0)} className="eyebrow flex items-center gap-4 text-gold">
              <span className="h-px w-10 bg-gold/60" aria-hidden /> For event professionals
            </m.p>
            <m.h1 {...fade(1)} className="mt-6 font-serif text-5xl leading-[1.02] md:text-6xl lg:text-7xl">
              Grow your business with <em className="text-champagne">every celebration.</em>
            </m.h1>
            <m.p {...fade(2)} className="mt-6 max-w-xl text-lg text-champagne/80">
              DJs, decorators, photographers, caterers, sound, lighting and stage teams: join verified professionals customers book with confidence.
            </m.p>
            <m.div {...fade(3)} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href={`/signup?next=${NEXT}`} className={buttonVariants({ variant: "gold", size: "xl" })}>
                Start your application <ArrowRight className="size-4" />
              </Link>
              <Link href={`/login?next=${NEXT}`} className="link-draw self-start py-2 text-sm text-ivory/80 hover:text-ivory sm:self-auto">
                Already applied? Sign in
              </Link>
            </m.div>
          </div>

          <m.div {...fade(2)} className="relative border border-gold/40 bg-black-cherry/40 p-8 backdrop-blur-sm">
            <div aria-hidden className="pointer-events-none absolute inset-2 border border-gold/15" />
            <p className="eyebrow text-[0.6rem] text-gold">What you&apos;ll need</p>
            <ul className="mt-5 space-y-3.5">
              {NEEDED.map((n) => (
                <li key={n} className="flex items-center gap-3 text-sm text-champagne/90">
                  <span className="size-1.5 rotate-45 bg-gold" aria-hidden /> {n}
                </li>
              ))}
            </ul>
            <p className="mt-6 flex items-center gap-2 border-t border-gold/20 pt-5 text-xs text-champagne/60">
              <MapPin className="size-3.5" /> Open to partners across India
            </p>
          </m.div>
        </div>
      </section>

      <section id="benefits" className="shell scroll-mt-24 py-20 md:py-28">
        <p className="eyebrow text-gold-deep">Why partner with us</p>
        <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight text-charcoal md:text-5xl">Built for the people who make events happen.</h2>
        <div className="mt-14 grid gap-px border border-champagne bg-champagne sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b, i) => (
            <m.div key={b.title} {...fade(i)} className="group bg-ivory p-8 transition-colors duration-500 hover:bg-white">
              <b.icon className="size-6 text-burgundy transition-transform duration-500 group-hover:-translate-y-1" strokeWidth={1.5} />
              <h3 className="mt-6 font-serif text-2xl text-charcoal">{b.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-grey">{b.text}</p>
            </m.div>
          ))}
        </div>
      </section>

      <section className="bg-sand py-20 md:py-52">
        <div className="shell">
          <p className="eyebrow text-gold-deep">How joining works</p>
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {PROCESS.map((p, i) => (
              <m.li key={p.title} {...fade(i)} className="relative">
                <span className="font-serif text-6xl text-gold/50">0{i + 1}</span>
                <p.icon className="absolute right-0 top-4 size-6 text-burgundy/70" strokeWidth={1.5} />
                <h3 className="mt-4 font-serif text-2xl text-charcoal">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-grey">{p.text}</p>
              </m.li>
            ))}
          </ol>
          <Link href={`/signup?next=${NEXT}`} className={cn(buttonVariants({ variant: "burgundy", size: "xl" }), "mt-14")}>
            Start your application <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
