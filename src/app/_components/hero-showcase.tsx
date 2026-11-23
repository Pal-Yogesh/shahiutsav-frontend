"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  m,
  type MotionValue,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Parallax } from "@/components/motion/effects";
import { useHeroOccasion } from "@/app/_components/hero-occasion";
import { cn } from "@/lib/utils";
import { HERO_SLIDES } from "@/data/homepage";

const EASE = [0.22, 1, 0.36, 1] as const;
const SLIDE_MS = 6500;
const COUNT = HERO_SLIDES.length;

// A word that rises out of a mask when it first appears
function RiseWord({ children, delay, className }: { children: React.ReactNode; delay: number; className?: string }) {
  return (
    <span className="inline-block overflow-hidden pb-[0.12em] align-top -mb-[0.12em]">
      <m.span
        className={cn("inline-block", className)}
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        {children}
      </m.span>
    </span>
  );
}

// The occasion word in the headline; slides vertically when it changes
function RotatingWord({ word }: { word: string }) {
  return (
    <m.span layout transition={{ duration: 0.6, ease: EASE }} className="relative inline-flex overflow-hidden pb-[0.12em] align-top -mb-[0.12em]">
      <AnimatePresence mode="popLayout" initial={false}>
        <m.span
          key={word}
          className="inline-block italic text-champagne"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          {word}
        </m.span>
      </AnimatePresence>
    </m.span>
  );
}

function EssentialsCard({
  slide,
  depthX,
  depthY,
}: {
  slide: (typeof HERO_SLIDES)[number];
  depthX: MotionValue<number>;
  depthY: MotionValue<number>;
}) {
  // Services the visitor has unticked, per occasion
  const [off, setOff] = useState<Record<string, string[]>>({});
  const removed = off[slide.id] ?? [];
  const selected = slide.essentials.filter((e) => !removed.includes(e.label));

  function toggle(label: string) {
    setOff((prev) => {
      const list = prev[slide.id] ?? [];
      return { ...prev, [slide.id]: list.includes(label) ? list.filter((l) => l !== label) : [...list, label] };
    });
  }

  return (
    <m.div
      style={{ x: depthX, y: depthY }}
      className="w-[22rem] border border-gold/35 bg-[#1A0A0E]/70 p-6 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-md motion-safe:animate-fade-up [animation-delay:1100ms]"
    >
      <AnimatePresence mode="wait">
        <m.div
          key={slide.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <p className="eyebrow text-gold">Your {slide.label.toLowerCase()} essentials</p>
          <p className="mt-2 font-serif text-2xl text-ivory">One event. One booking.</p>

          <ul className="mt-5 divide-y divide-ivory/10 border-y border-ivory/10">
            {slide.essentials.map((item) => {
              const on = !removed.includes(item.label);
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggle(item.label)}
                    className="group flex w-full items-center gap-3 py-2.5 text-left"
                  >
                    <span className="relative size-10 shrink-0 overflow-hidden">
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="40px"
                        className={cn("photo-grade object-cover transition-all duration-500", !on && "grayscale opacity-40")}
                      />
                    </span>
                    <span className={cn("flex-1 text-sm transition-colors", on ? "text-ivory/90" : "text-ivory/40 line-through")}>
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center border transition-all duration-300",
                        on ? "border-gold bg-gold text-charcoal" : "border-ivory/30 text-transparent group-hover:border-gold/70"
                      )}
                    >
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs tracking-wide text-champagne/60">
              {selected.length} {selected.length === 1 ? "service" : "services"} · 1 date
            </p>
            <Link
              href={`/search?q=${slide.id}`}
              className="group flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold transition-colors hover:text-champagne"
            >
              Find these vendors
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </m.div>
      </AnimatePresence>
    </m.div>
  );
}

export function HeroShowcase({ search, popular, marquee }: { search: React.ReactNode; popular: React.ReactNode; marquee: React.ReactNode }) {
  const ctx = useHeroOccasion();
  const reduce = useReducedMotion();
  const [autoIndex, setAutoIndex] = useState(0);
  const [hovering, setHovering] = useState(false);

  // A visitor's choice wins; otherwise the banner cycles through occasions
  const chosenIndex = HERO_SLIDES.findIndex((s) => s.id === ctx?.chosen);
  const index = chosenIndex >= 0 ? chosenIndex : autoIndex;
  const slide = HERO_SLIDES[index];
  const autoplay = chosenIndex < 0 && !reduce && !hovering;

  useEffect(() => {
    if (!autoplay) return;
    const id = setTimeout(() => setAutoIndex((i) => (i + 1) % COUNT), SLIDE_MS);
    return () => clearTimeout(id);
  }, [autoplay, autoIndex]);

  // Gentle depth: backdrop and card drift with the mouse
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const bgX = useTransform(sx, [-0.5, 0.5], [18, -18]);
  const bgY = useTransform(sy, [-0.5, 0.5], [12, -12]);
  const cardX = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const cardY = useTransform(sy, [-0.5, 0.5], [-8, 8]);

  function handleMove(e: React.PointerEvent<HTMLElement>) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }

  return (
    <section
      onPointerMove={handleMove}
      className="grain relative isolate flex min-h-svh flex-col overflow-hidden bg-charcoal text-ivory"
    >
      {/* Backdrop: one photo per occasion, crossfading with a slow zoom */}
      <Parallax className="!absolute inset-0 -z-10" distance={120}>
        <m.div style={{ x: bgX, y: bgY }} className="absolute -inset-6">
          {HERO_SLIDES.map((s, i) => (
            <Image
              key={s.id}
              src={s.image}
              alt={i === index ? s.alt : ""}
              fill
              sizes="100vw"
              priority={i === 0}
              className={cn(
                "photo-grade object-cover transition-[opacity,transform] duration-[1.6s] ease-out",
                i === index ? "scale-100 opacity-100" : "scale-[1.08] opacity-0"
              )}
            />
          ))}
        </m.div>
      </Parallax>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-charcoal/95 via-black-cherry/72 to-burgundy/25" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal via-charcoal/10 to-charcoal/70" />

      <div className="shell flex flex-1 flex-col justify-center pt-28 pb-10 sm:pt-32 sm:pb-14 lg:pt-36">
        <div className="flex items-end justify-between gap-12">
          {/* min-w-0 lets the occasion row scroll instead of widening the page */}
          <div className="min-w-0 max-w-[60rem]">
            <p className="eyebrow flex items-center gap-4 text-gold motion-safe:animate-fade-up">
              <span className="h-px w-12 bg-gold" aria-hidden />
              India&apos;s event services marketplace
            </p>

            <h1 className="mt-6 font-serif text-[2.9rem] font-normal leading-[0.98] tracking-[-0.01em] sm:mt-7 sm:text-7xl lg:text-[5.75rem]">
              <RiseWord delay={0.15}>Every</RiseWord> <RotatingWord word={slide.word} />{" "}
              <RiseWord delay={0.3}>deserves</RiseWord> <RiseWord delay={0.37}>something</RiseWord>{" "}
              <RiseWord delay={0.44} className="italic text-gold">extraordinary.</RiseWord>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-champagne/80 sm:mt-8 sm:text-lg motion-safe:animate-fade-up [animation-delay:700ms]">
              Discover and book India&apos;s finest DJs, decorators, photographers, caterers and event equipment,
              all in one place.
            </p>

            {/* Occasion picker: cycles until the visitor chooses */}
            <div
              className="mt-7 motion-safe:animate-fade-up [animation-delay:800ms] sm:mt-9"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              <p className="eyebrow text-[0.6rem] text-champagne/50">I&apos;m planning a</p>
              <div role="tablist" aria-label="Choose your occasion" className="-mx-1 mt-3 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none]">
                {HERO_SLIDES.map((s, i) => {
                  const active = i === index;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => ctx?.choose(s.id)}
                      className={cn(
                        "relative shrink-0 border px-4 py-2 text-sm transition-colors duration-300",
                        active ? "border-gold/70 bg-gold/10 text-ivory" : "border-ivory/15 text-ivory/65 hover:border-ivory/40 hover:text-ivory"
                      )}
                    >
                      {s.label}
                      {/* Progress while cycling; solid once chosen */}
                      {active && (
                        <span className="absolute inset-x-0 -bottom-px h-[2px] overflow-hidden">
                          <m.span
                            key={`${index}-${autoplay}`}
                            className="block h-full origin-left bg-gold"
                            initial={{ scaleX: autoplay ? 0 : 1 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: autoplay ? SLIDE_MS / 1000 : 0, ease: "linear" }}
                          />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            className="hidden xl:block"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            <EssentialsCard slide={slide} depthX={cardX} depthY={cardY} />
          </div>
        </div>

        <div className="mt-8 motion-safe:animate-fade-up [animation-delay:1000ms] sm:mt-12">
          {search}
          {popular}
        </div>

      </div>

      {marquee}
    </section>
  );
}
