"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { HERO_SLIDES } from "@/data/homepage";

const EASE = [0.22, 1, 0.36, 1] as const;
const SLIDE_MS = 5500;

const COPY = {
  login: {
    eyebrow: "Welcome back",
    title: ["Your celebrations,", "beautifully planned."],
    points: ["Pick up where you left off", "Track bookings and vendor replies", "One booking for every service"],
  },
  signup: {
    eyebrow: "Join ShahiUtsav",
    title: ["Every great event", "starts with hello."],
    points: ["Verified DJs, décor, photographers and caterers", "Compare packages side by side", "Free to join for customers and vendors"],
  },
} as const;

// Corner flourish matching the invitation-card frames elsewhere on the site
function Corner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={cn("absolute size-10 text-gold", className)}>
      <path d="M2 46V14C2 7.4 7.4 2 14 2h32" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M8 46V18C8 12.5 12.5 8 18 8h28" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
      <path d="M14 10l3 4-3 4-3-4z" fill="currentColor" />
    </svg>
  );
}

// The logo's arch monogram, drawn in gold line by line
function DrawnCrest() {
  return (
    <svg viewBox="0 0 80 80" aria-hidden className="size-16">
      <m.circle
        cx="40" cy="40" r="38" fill="none" stroke="#C6A15B" strokeWidth="0.8"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: EASE }}
      />
      <m.path
        d="M22 66V38C22 28 30 20 40 20s18 8 18 18v28" fill="none" stroke="#C6A15B" strokeWidth="2.2" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, delay: 0.3, ease: EASE }}
      />
      <m.path
        d="M40 30l9 12-9 12-9-12z" fill="#E8D6B5"
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 1.2, ease: EASE }}
        style={{ transformOrigin: "40px 42px" }}
      />
    </svg>
  );
}

export function AuthShowcase({ mode, compact = false }: { mode: "login" | "signup"; compact?: boolean }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const copy = COPY[mode];
  const slide = HERO_SLIDES[index];

  useEffect(() => {
    if (reduce) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % HERO_SLIDES.length), SLIDE_MS);
    return () => clearTimeout(id);
  }, [index, reduce]);

  return (
    <div className="grain relative isolate h-full overflow-hidden bg-black-cherry text-ivory">
      {/* Photos crossfade with a slow zoom */}
      {HERO_SLIDES.map((s, i) => (
        <Image
          key={s.id}
          src={s.image}
          alt=""
          fill
          priority={i === 0}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={cn(
            "-z-20 photo-grade object-cover transition-[opacity,transform] duration-[1.8s] ease-out",
            i === index ? "scale-100 opacity-100" : "scale-110 opacity-0"
          )}
        />
      ))}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-black-cherry/80 via-burgundy/70 to-[#1A0A0E]/95" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_40%,rgba(198,161,91,0.18),transparent_70%)]" />

      {compact ? (
        // Phones: a short decorative band above the form
        <div className="flex h-full items-end justify-between gap-4 p-5">
          <div>
            <p className="eyebrow text-[0.6rem] text-gold">{copy.eyebrow}</p>
            <p className="mt-1 font-serif text-2xl leading-tight">
              {copy.title[0]} <em className="text-champagne">{copy.title[1]}</em>
            </p>
          </div>
        </div>
      ) : (
        <div className="relative flex h-full flex-col p-10 xl:p-14">
          {/* Invitation frame */}
          <div aria-hidden className="pointer-events-none absolute inset-6 border border-gold/45" />
          <div aria-hidden className="pointer-events-none absolute inset-8 border border-gold/20" />
          <Corner className="left-9 top-9" />
          <Corner className="right-9 top-9 rotate-90" />
          <Corner className="bottom-9 right-9 rotate-180" />
          <Corner className="bottom-9 left-9 -rotate-90" />

          <div className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
            <DrawnCrest />
            <m.p
              className="eyebrow mt-8 flex items-center gap-4 text-gold"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8, ease: EASE }}
            >
              <span className="h-px w-8 bg-gold/60" aria-hidden />
              {copy.eyebrow}
              <span className="h-px w-8 bg-gold/60" aria-hidden />
            </m.p>
            <h2 className="mt-6 font-serif text-5xl leading-[1.05] xl:text-6xl">
              {copy.title.map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.1em]">
                  <m.span
                    className={cn("block", i === 1 && "italic text-champagne")}
                    initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ delay: 0.7 + i * 0.12, duration: 1.1, ease: EASE }}
                  >
                    {line}
                  </m.span>
                </span>
              ))}
            </h2>

            <ul className="mt-10 space-y-3 text-left">
              {copy.points.map((point, i) => (
                <m.li
                  key={point}
                  className="flex items-center gap-3 text-sm text-champagne/85"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1 + i * 0.12, duration: 0.6 }}
                >
                  <span className="flex size-5 shrink-0 items-center justify-center border border-gold/60 text-gold">
                    <Check className="size-3" strokeWidth={2.5} />
                  </span>
                  {point}
                </m.li>
              ))}
            </ul>
          </div>

          {/* Current photo caption and progress */}
          <div className="relative flex items-end justify-between px-6 pb-4">
            <AnimatePresence mode="wait">
              <m.p
                key={slide.id}
                className="font-serif text-lg italic text-champagne/80"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.5 }}
              >
                {slide.label}
              </m.p>
            </AnimatePresence>
            <div className="flex gap-1.5">
              {HERO_SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show ${s.label} photo`}
                  className={cn("h-[3px] transition-all duration-500", i === index ? "w-8 bg-gold" : "w-3 bg-ivory/30 hover:bg-ivory/60")}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
