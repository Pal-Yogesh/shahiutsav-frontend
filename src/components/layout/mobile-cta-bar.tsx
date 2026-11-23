"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { ArrowRight } from "lucide-react";

// Phones only: a slim booking bar that appears after the hero and steps aside
// when the closing call-to-action or the footer is on screen.
export function MobileCtaBar() {
  const [pastHero, setPastHero] = useState(false);
  const [nearEnd, setNearEnd] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const targets = [document.getElementById("start-planning"), document.querySelector("footer")].filter(
      (el): el is HTMLElement => el !== null
    );
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      setNearEnd(visible.size > 0);
    });
    targets.forEach((t) => observer.observe(t));

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  const show = pastHero && !nearEnd;

  return (
    <AnimatePresence>
      {show && (
        <m.div
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/30 bg-black-cherry/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-ivory backdrop-blur-md md:hidden"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow text-[0.6rem] text-gold">Planning an event?</p>
              <p className="truncate font-serif text-lg leading-tight">Compare &amp; book vendors</p>
            </div>
            <Link
              href="/search"
              className="flex h-11 shrink-0 items-center gap-2 bg-gold px-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-charcoal transition-colors active:bg-champagne"
            >
              Find vendors <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
