"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { TESTIMONIALS } from "@/data/homepage";

const EASE = [0.22, 1, 0.36, 1] as const;
const DURATION = 7000; // ms each story stays on screen
const COUNT = TESTIMONIALS.length;

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const story = TESTIMONIALS[index];

  const go = useCallback((next: number) => setIndex(((next % COUNT) + COUNT) % COUNT), []);

  // Auto-advance; restarts whenever the story changes. Off for reduced-motion users.
  useEffect(() => {
    if (paused || reduce) return;
    const id = setTimeout(() => go(index + 1), DURATION);
    return () => clearTimeout(id);
  }, [index, paused, reduce, go]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Customer stories"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden bg-ivory pt-[calc(4.75rem+2svh)] pb-[3svh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      {/* Oversized quote mark as a watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-[-2rem] top-[4svh] hidden select-none font-serif text-[clamp(18rem,40svh,30rem)] leading-none text-champagne/40 md:block"
      >
        &rdquo;
      </span>

      <div className="shell relative w-full">
        {/* Compact heading so the whole section fits one screen */}
        <Reveal className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <p className="eyebrow flex items-center gap-4 text-gold-deep">
              <span className="h-px w-10 bg-gold-deep/50" aria-hidden />
              Stories
            </p>
            <h2 className="mt-[clamp(0.5rem,1.4svh,1rem)] font-serif text-[clamp(2rem,5.2svh,3.5rem)] leading-[1.05] text-charcoal">
              Experiences worth <em className="text-wine">celebrating.</em>
            </h2>
          </div>
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-grey md:text-xs">
            Sample stories<span className="hidden md:inline"> · replaced with real reviews at launch</span>
          </p>
        </Reveal>

        <div className="mt-[clamp(1rem,3.5svh,3rem)] grid gap-[clamp(1rem,2.6svh,2.5rem)] lg:mt-[clamp(2.25rem,6svh,4rem)] lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-16">
          {/* ── Photo stage ── */}
          <div className="relative">
            <div aria-hidden className="pointer-events-none absolute -inset-2 border border-gold/35 md:-inset-4" />
            <div className="relative h-[clamp(8.5rem,21svh,22rem)] overflow-hidden bg-black-cherry lg:h-[clamp(18rem,56svh,36rem)]">
              {TESTIMONIALS.map((t, i) => (
                <Image
                  key={t.name}
                  src={t.image}
                  alt={`${t.event} in ${t.city}`}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className={cn(
                    "photo-grade object-cover transition-all duration-[1.4s] ease-out",
                    i === index ? "scale-100 opacity-100" : "scale-110 opacity-0"
                  )}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black-cherry/85 via-black-cherry/10 to-transparent" />

              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 md:inset-x-7 md:bottom-7">
                <AnimatePresence mode="wait">
                  <m.div
                    key={index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    <p className="eyebrow text-gold">{story.city}</p>
                    <p className="mt-1 font-serif text-2xl text-ivory md:text-4xl">{story.event}</p>
                  </m.div>
                </AnimatePresence>
                <p className="font-serif text-ivory/80 lining-nums">
                  <span className="text-3xl text-ivory md:text-5xl">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-lg"> / {String(COUNT).padStart(2, "0")}</span>
                </p>
              </div>
            </div>
          </div>

          {/* ── Story ── */}
          <div className="flex flex-col">
            <div className="min-h-[clamp(9rem,21svh,13rem)] lg:min-h-[clamp(14rem,34svh,20rem)]" aria-live="polite">
              <AnimatePresence mode="wait">
                <m.figure
                  key={index}
                  initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
                  transition={{ duration: 0.7, ease: EASE }}
                >
                  <span aria-hidden className="hidden font-serif text-[clamp(3.5rem,8svh,6rem)] leading-[0.5] text-gold-deep lg:block">&ldquo;</span>
                  <blockquote className="border-l-2 border-gold/60 pl-4 font-serif lg:mt-[clamp(0.5rem,1.6svh,1.25rem)] lg:border-0 lg:pl-0 text-[clamp(1.2rem,2.7svh,1.6rem)] leading-[1.3] text-charcoal md:text-[clamp(1.5rem,3.6svh,2.4rem)] md:leading-[1.25]">
                    {story.text}
                  </blockquote>

                  <figcaption className="mt-[clamp(0.75rem,2.6svh,2rem)] flex flex-wrap items-center gap-x-6 gap-y-3">
                    <span className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-full border border-gold/50 bg-burgundy font-serif text-lg text-ivory md:size-12 md:text-xl">
                        {story.name[0]}
                      </span>
                      <span>
                        <span className="block font-medium text-charcoal">{story.name}</span>
                        <span className="block text-sm text-muted-grey">
                          {story.event} · {story.city}
                        </span>
                      </span>
                    </span>
                    <span aria-hidden className="hidden h-10 w-px bg-champagne sm:block" />
                    <span className="hidden flex-wrap gap-2 min-[400px]:flex">
                      {story.booked.map((service) => (
                        <span key={service} className="border border-champagne px-2.5 py-1 text-xs text-charcoal/75">
                          {service}
                        </span>
                      ))}
                    </span>
                  </figcaption>
                </m.figure>
              </AnimatePresence>
            </div>

            {/* ── Controls ── */}
            <div className="mt-[clamp(0.75rem,3svh,2.5rem)] flex items-center gap-6 border-t border-champagne pt-[clamp(0.75rem,2.6svh,2rem)]">
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Previous story"
                  onClick={() => go(index - 1)}
                  className="flex size-11 items-center justify-center border border-charcoal/20 text-charcoal transition-colors duration-500 hover:border-burgundy hover:bg-burgundy hover:text-ivory"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next story"
                  onClick={() => go(index + 1)}
                  className="flex size-11 items-center justify-center border border-charcoal/20 text-charcoal transition-colors duration-500 hover:border-burgundy hover:bg-burgundy hover:text-ivory"
                >
                  <ArrowRight className="size-4" />
                </button>
              </div>

              {/* One segment per story; the active one fills while it plays */}
              <ol className="grid flex-1 gap-3" style={{ gridTemplateColumns: `repeat(${COUNT}, minmax(0, 1fr))` }}>
                {TESTIMONIALS.map((t, i) => (
                  <li key={t.name}>
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-label={`Story ${i + 1}: ${t.name}, ${t.event}`}
                      aria-current={i === index ? "true" : undefined}
                      className="group block w-full py-2 text-left"
                    >
                      <span className="relative block h-[2px] overflow-hidden bg-champagne">
                        {i < index && <span className="absolute inset-0 bg-burgundy/40" />}
                        {i === index && (
                          <m.span
                            key={`${index}-${paused}`}
                            className="absolute inset-0 origin-left bg-burgundy"
                            initial={{ scaleX: paused || reduce ? 1 : 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: paused || reduce ? 0 : DURATION / 1000, ease: "linear" }}
                          />
                        )}
                      </span>
                      <span
                        className={cn(
                          "mt-3 hidden truncate text-xs uppercase tracking-[0.16em] transition-colors sm:block",
                          i === index ? "text-burgundy" : "text-muted-grey group-hover:text-charcoal"
                        )}
                      >
                        {t.name} · {t.event}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
