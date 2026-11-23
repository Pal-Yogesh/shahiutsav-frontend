"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, m } from "framer-motion";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";
import { GALLERY } from "@/data/homepage";

const EASE = [0.22, 1, 0.36, 1] as const;
const COUNT = GALLERY.length;

// Eight tiles that pack into exactly three rows on desktop and four on mobile
const TILE_SPANS = [
  "row-span-2",
  "col-span-2 lg:col-span-2",
  "row-span-2 lg:row-span-2",
  "",
  "",
  "col-span-2",
  "",
  "",
];

function Lightbox({ index, onClose, onGo }: { index: number; onClose: () => void; onGo: (i: number) => void }) {
  const item = GALLERY[index];
  const closeRef = useRef<HTMLButtonElement>(null);

  // Keyboard: Esc closes, arrows browse. Page behind stays still while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onGo(index + 1);
      if (e.key === "ArrowLeft") onGo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prev;
    };
  }, [index, onClose, onGo]);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <m.div
      role="dialog"
      aria-modal="true"
      aria-label={`${item.label}, photo ${index + 1} of ${COUNT}`}
      data-lenis-prevent
      className="fixed inset-0 z-[70] flex flex-col bg-[#120609]/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 text-ivory md:px-8" onClick={(e) => e.stopPropagation()}>
        <p className="font-serif text-lg lining-nums text-champagne/80">
          <span className="text-2xl text-ivory">{String(index + 1).padStart(2, "0")}</span> / {String(COUNT).padStart(2, "0")}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="flex size-11 items-center justify-center border border-ivory/25 transition-colors hover:border-gold hover:bg-gold hover:text-charcoal"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Photo */}
      <div className="relative flex-1 px-4 md:px-24">
        <AnimatePresence mode="wait">
          <m.div
            key={index}
            className="absolute inset-y-0 inset-x-4 md:inset-x-24"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <Image
              src={item.image}
              alt={item.label}
              fill
              sizes="100vw"
              className="photo-grade object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </m.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onGo(index - 1); }}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center border border-ivory/25 bg-black-cherry/50 text-ivory transition-colors hover:border-gold hover:bg-gold hover:text-charcoal md:left-8"
        >
          <ArrowLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onGo(index + 1); }}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center border border-ivory/25 bg-black-cherry/50 text-ivory transition-colors hover:border-gold hover:bg-gold hover:text-charcoal md:right-8"
        >
          <ArrowRight className="size-5" />
        </button>
      </div>

      {/* Caption and thumbnails */}
      <div className="px-5 pb-5 pt-4 md:px-8 md:pb-7" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          <m.p
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center font-serif text-2xl italic text-ivory md:text-3xl"
          >
            {item.label}
          </m.p>
        </AnimatePresence>
        <div className="mx-auto mt-4 flex max-w-full justify-center gap-2 overflow-x-auto [scrollbar-width:none]">
          {GALLERY.map((g, i) => (
            <button
              key={g.label}
              type="button"
              onClick={() => onGo(i)}
              aria-label={`Show ${g.label}`}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "relative h-12 w-16 shrink-0 overflow-hidden border transition-all duration-300 md:h-14 md:w-20",
                i === index ? "border-gold opacity-100" : "border-transparent opacity-45 hover:opacity-80"
              )}
            >
              <Image src={g.image} alt="" fill sizes="80px" className="photo-grade object-cover" />
            </button>
          ))}
        </div>
      </div>
    </m.div>
  );
}

// True only in the browser, false during server render and hydration
const noop = () => () => {};
function useIsClient() {
  return useSyncExternalStore(noop, () => true, () => false);
}

export function Gallery() {
  const isClient = useIsClient();
  const [open, setOpen] = useState<number | null>(null);
  const go = useCallback((i: number) => setOpen(((i % COUNT) + COUNT) % COUNT), []);
  const close = useCallback(() => setOpen(null), []);

  return (
    <section className="bg-ivory py-24 md:py-32">
      <div className="shell">
        <SectionHeading
          align="center"
          eyebrow="Inspiration"
          title={<>A glimpse of what we <em className="text-wine">make possible.</em></>}
          description="Tap any photo to view it full screen."
        />

        <div className="mt-16 grid grid-flow-dense auto-rows-[160px] grid-cols-2 gap-3 md:auto-rows-[220px] md:gap-4 lg:grid-cols-4">
          {GALLERY.map((item, i) => (
            <Reveal key={item.label} delay={(i % 4) * 0.08} className={cn("h-full", TILE_SPANS[i % TILE_SPANS.length])}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`Open ${item.label} full screen`}
                className="group relative block h-full w-full cursor-zoom-in overflow-hidden bg-champagne/40 text-left"
              >
                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="photo-grade object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black-cherry/85 via-black-cherry/10 to-transparent p-5 opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="translate-y-3 font-serif text-2xl italic text-ivory transition-transform duration-700 group-hover:translate-y-0">
                    {item.label}
                  </span>
                  <span className="flex size-9 items-center justify-center rounded-full border border-ivory/40 text-ivory">
                    <Expand className="size-4" />
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {isClient &&
        createPortal(
          <AnimatePresence>{open !== null && <Lightbox index={open} onClose={close} onGo={go} />}</AnimatePresence>,
          document.body
        )}
    </section>
  );
}
