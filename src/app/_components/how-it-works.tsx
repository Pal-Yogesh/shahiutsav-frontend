"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, m, useInView, useScroll, useSpring } from "framer-motion";
import { CalendarDays, Check, Clock, MapPin, Search, Users } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";
import { STEPS } from "@/data/homepage";

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Example screens shown over each step's photo ──────────────────────
// Illustrative only and labelled as such, so they never read as real listings.

function MockShell({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="w-full max-w-sm border border-champagne/60 bg-ivory/95 p-5 text-charcoal shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <p className="eyebrow text-[0.6rem] text-gold-deep">{label}</p>
        <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-grey">Example</p>
      </div>
      {children}
    </div>
  );
}

function DiscoverMock() {
  return (
    <MockShell label="Your event">
      <div className="grid grid-cols-3 divide-x divide-champagne border border-champagne text-xs">
        {[
          { icon: Users, text: "Wedding" },
          { icon: MapPin, text: "Jaipur" },
          { icon: CalendarDays, text: "15 Dec" },
        ].map(({ icon: Icon, text }) => (
          <span key={text} className="flex items-center gap-1.5 whitespace-nowrap px-2 py-2.5 text-[0.68rem] sm:px-2.5 sm:text-xs">
            <Icon className="size-3.5 text-burgundy" strokeWidth={1.5} />
            {text}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {["DJ & sound", "Mandap décor", "Photography", "Catering"].map((chip, i) => (
          <m.span
            key={chip}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.08 }}
            className={cn(
              "border px-2.5 py-1 text-[0.7rem]",
              i < 2 ? "border-burgundy bg-burgundy text-ivory" : "border-champagne text-charcoal/70"
            )}
          >
            {chip}
          </m.span>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 bg-burgundy px-3 py-2.5 text-xs text-ivory">
        <Search className="size-3.5" />
        Showing vendors free on your date
      </div>
    </MockShell>
  );
}

function CompareMock() {
  const rows = [
    { name: "Sangeet DJ", meta: "5 hrs · sound included", price: "₹25,000" },
    { name: "DJ + stage lights", meta: "6 hrs · 2 technicians", price: "₹38,000", selected: true },
    { name: "Full production", meta: "8 hrs · LED wall", price: "₹55,000" },
  ];
  return (
    <MockShell label="Compare packages">
      <ul className="space-y-2">
        {rows.map((r, i) => (
          <m.li
            key={r.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className={cn(
              "flex items-center justify-between gap-3 border px-3 py-2.5",
              r.selected ? "border-burgundy bg-burgundy/5" : "border-champagne"
            )}
          >
            <span>
              <span className="block text-sm font-medium">{r.name}</span>
              <span className="block text-[0.7rem] text-muted-grey">{r.meta}</span>
            </span>
            <span className="text-right">
              <span className="block font-serif text-lg text-burgundy">{r.price}</span>
              {r.selected && <span className="block text-[0.6rem] uppercase tracking-[0.18em] text-gold-deep">Selected</span>}
            </span>
          </m.li>
        ))}
      </ul>
    </MockShell>
  );
}

function BookMock() {
  return (
    <MockShell label="Booking confirmed">
      <ul className="divide-y divide-champagne border-y border-champagne">
        {["DJ & sound", "Floral mandap décor", "Candid photography"].map((item, i) => (
          <m.li
            key={item}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.12 }}
            className="flex items-center justify-between py-2.5 text-sm"
          >
            {item}
            <span className="flex size-5 items-center justify-center rounded-full bg-burgundy text-ivory">
              <Check className="size-3" strokeWidth={3} />
            </span>
          </m.li>
        ))}
      </ul>
      <div className="mt-4">
        <div className="flex justify-between text-[0.7rem] text-muted-grey">
          <span>Advance paid</span>
          <span>3 vendors · 1 date</span>
        </div>
        <div className="mt-2 h-1 bg-champagne">
          <m.div
            className="h-full origin-left bg-gold"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 0.3 }}
            transition={{ delay: 0.5, duration: 1, ease: EASE }}
          />
        </div>
      </div>
    </MockShell>
  );
}

function CelebrateMock() {
  const timeline = [
    { time: "4:00 PM", text: "Décor set up", done: true },
    { time: "6:30 PM", text: "Sound check", done: true },
    { time: "8:00 PM", text: "Guests arrive", done: false },
  ];
  return (
    <MockShell label="Event day">
      <ol className="relative space-y-4 pl-6">
        <span aria-hidden className="absolute left-[7px] top-1 bottom-1 w-px bg-champagne" />
        {timeline.map((t, i) => (
          <m.li
            key={t.text}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.12 }}
            className="relative"
          >
            <span
              className={cn(
                "absolute -left-6 top-0.5 size-[15px] rounded-full border-2",
                t.done ? "border-burgundy bg-burgundy" : "border-gold bg-ivory"
              )}
            />
            <span className="flex items-center gap-1.5 text-[0.7rem] text-muted-grey">
              <Clock className="size-3" /> {t.time}
            </span>
            <span className="text-sm font-medium">{t.text}</span>
          </m.li>
        ))}
      </ol>
    </MockShell>
  );
}

const MOCKS = [DiscoverMock, CompareMock, BookMock, CelebrateMock];

// ─── Visual: photo + example screen for a step ─────────────────────────

function StepVisual({ index, className }: { index: number; className?: string }) {
  const Mock = MOCKS[index];
  return (
    <div className={cn("relative overflow-hidden bg-black-cherry", className)}>
      {STEPS.map((step, i) => (
        <Image
          key={step.title}
          src={step.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={cn(
            "photo-grade object-cover transition-all duration-[1.2s] ease-out",
            i === index ? "scale-100 opacity-100" : "scale-110 opacity-0"
          )}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black-cherry/90 via-black-cherry/30 to-black-cherry/10" />

      <span aria-hidden className="absolute right-6 top-2 font-serif text-[8rem] italic leading-none text-ivory/15 lining-nums md:text-[10rem]">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="absolute inset-x-5 bottom-5 md:inset-x-8 md:bottom-8">
        <AnimatePresence mode="wait">
          <m.div
            key={index}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <Mock />
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── One step in the scrolling list ────────────────────────────────────

function StepBlock({
  index,
  active,
  onActive,
  innerRef,
}: {
  index: number;
  active: boolean;
  onActive: (i: number) => void;
  innerRef: (el: HTMLDivElement | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Active while the step crosses the middle band of the viewport
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  const step = STEPS[index];

  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  return (
    <div
      ref={(el) => {
        ref.current = el;
        innerRef(el);
      }}
      className="relative scroll-mt-32 pb-16 pl-14 md:pl-20 lg:flex lg:min-h-[78vh] lg:flex-col lg:justify-center lg:pb-0"
    >
      <div className="relative">
        {/* Node on the progress line */}
      <span
        aria-hidden
        className={cn(
          "absolute -left-14 -top-2 flex size-9 items-center justify-center rounded-full border font-serif text-sm italic transition-all duration-700 md:-left-20 md:size-11",
          active ? "scale-110 border-burgundy bg-burgundy text-ivory shadow-[0_0_0_6px_rgba(198,161,91,0.18)]" : "border-champagne bg-ivory text-gold-deep"
        )}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className={cn("transition-opacity duration-700", active ? "opacity-100" : "lg:opacity-35")}>
        <p className="eyebrow text-gold-deep">Step {String(index + 1).padStart(2, "0")}</p>
        <h3 className="mt-3 font-serif text-5xl leading-none text-charcoal md:text-7xl">{step.title}</h3>
        <p className="mt-5 max-w-md font-serif text-2xl italic leading-snug text-wine">{step.tagline}</p>
        <p className="mt-4 max-w-md leading-relaxed text-muted-grey">{step.description}</p>
        <ul className="mt-6 max-w-md divide-y divide-champagne border-y border-champagne">
          {step.points.map((point) => (
            <li key={point} className="flex items-center gap-3 py-3 text-sm text-charcoal">
              <Check className="size-4 shrink-0 text-gold-deep" strokeWidth={1.75} />
              {point}
            </li>
          ))}
        </ul>

        {/* Mobile and tablet: the visual sits inline under each step */}
        <StepVisual index={index} className="mt-8 aspect-[4/5] sm:aspect-[4/3] lg:hidden" />
      </div>
      </div>
    </div>
  );
}

// ─── Section ───────────────────────────────────────────────────────────

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Gold line fills as the list scrolls through the viewport
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 60%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  const goTo = (i: number) => stepRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <section id="how-it-works" className="relative scroll-mt-20 bg-ivory py-24 md:py-36">
      <div className="shell">
        <SectionHeading
          align="center"
          eyebrow="How it works"
          title={<>From first idea to <em className="text-wine">final dance.</em></>}
          description="Four simple steps from planning your event to enjoying it."
        />

        {/* Step navigator */}
        <nav aria-label="Steps" className="mt-12 flex justify-center">
          <ol className="flex max-w-full gap-6 overflow-x-auto border-b border-champagne px-2 [scrollbar-width:none] md:gap-12">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={active === i ? "step" : undefined}
                  className={cn(
                    "relative flex shrink-0 items-baseline gap-2 pb-4 transition-colors duration-300",
                    active === i ? "text-burgundy" : "text-charcoal/45 hover:text-charcoal"
                  )}
                >
                  <span className="font-serif text-sm italic">0{i + 1}</span>
                  <span className="font-serif text-xl md:text-2xl">{step.title}</span>
                  {active === i && (
                    <m.span layoutId="step-line" className="absolute inset-x-0 -bottom-px h-[2px] bg-burgundy" transition={{ type: "spring", bounce: 0.15, duration: 0.6 }} />
                  )}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-16 grid gap-16 lg:mt-8 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
          {/* Desktop: pinned visual that follows the active step */}
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <div aria-hidden className="pointer-events-none absolute -inset-4 border border-gold/30" />
              <StepVisual index={active} className="h-[calc(100vh-10rem)] max-h-[680px] min-h-[520px]" />
            </div>
          </div>

          {/* Steps with progress line */}
          <div ref={listRef} className="relative">
            <span aria-hidden className="absolute left-[17px] top-0 bottom-0 w-px bg-champagne md:left-[21px]" />
            <m.span
              aria-hidden
              style={{ scaleY: fill }}
              className="absolute left-[17px] top-0 bottom-0 w-px origin-top bg-gradient-to-b from-gold via-wine to-burgundy md:left-[21px]"
            />
            {STEPS.map((step, i) => (
              <StepBlock
                key={step.title}
                index={i}
                active={active === i}
                onActive={setActive}
                innerRef={(el) => {
                  stepRefs.current[i] = el;
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
