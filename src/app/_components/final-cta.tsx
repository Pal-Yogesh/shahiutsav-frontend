import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Parallax, SplitHeadline } from "@/components/motion/effects";
import { Spotlight } from "@/components/motion/spotlight";
import { cn } from "@/lib/utils";
import { FINAL_CTA_IMAGE } from "@/data/homepage";

const PROMISES = ["Verified vendors", "Transparent pricing", "One booking for every service"] as const;

// Small gold diamond-and-arch flourish for the invitation card corners
function CornerOrnament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={cn("pointer-events-none absolute z-10 size-8 text-gold md:size-10", className)}>
      <path d="M2 46V14C2 7.4 7.4 2 14 2h32" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M8 46V18C8 12.5 12.5 8 18 8h28" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
      <path d="M14 10l3 4-3 4-3-4z" fill="currentColor" />
    </svg>
  );
}

// The arch monogram from the logo, set in a gold medallion
function Crest() {
  return (
    <div className="relative mx-auto flex size-[clamp(2.75rem,6.5svh,4.5rem)] items-center justify-center rounded-full border border-gold/60 bg-black-cherry">
      <span aria-hidden className="absolute inset-1.5 rounded-full border border-gold/25" />
      <svg viewBox="0 0 40 40" aria-hidden className="size-[55%]">
        <path d="M8 36V19C8 12.4 13.4 7 20 7s12 5.4 12 12v17" fill="none" stroke="#C6A15B" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M20 14l5.5 7.5L20 29l-5.5-7.5z" fill="#E8D6B5" />
        <circle cx="20" cy="21.5" r="1.4" fill="#C6A15B" />
      </svg>
    </div>
  );
}

export function FinalCta() {
  return (
    <section id="start-planning" className="grain relative isolate flex min-h-svh overflow-hidden bg-black-cherry text-ivory">
      {/* Photo drifts slower than the page, under a deep burgundy veil */}
      <Parallax className="!absolute inset-0 -z-20" distance={90}>
        <Image src={FINAL_CTA_IMAGE} alt="" fill sizes="100vw" className="photo-grade object-cover" />
      </Parallax>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-burgundy/85 via-[#4A1522]/92 to-[#2A0D14]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_45%,rgba(198,161,91,0.16),transparent_70%)]" />

      <Spotlight className="relative flex w-full items-center pt-[calc(4.75rem+1.5svh)] pb-[2.5svh]">
        <div className="shell w-full">
          <Reveal y={40}>
            <div className="relative mx-auto max-w-5xl">
              {/* Invitation card: hairline outer frame, inner frame and corner ornaments */}
              <div aria-hidden className="pointer-events-none absolute inset-0 z-10 border border-gold/60" />
              <div aria-hidden className="pointer-events-none absolute inset-2.5 z-10 border border-gold/30 md:inset-3.5" />
              <CornerOrnament className="left-3.5 top-3.5 md:left-5 md:top-5" />
              <CornerOrnament className="right-3.5 top-3.5 rotate-90 md:right-5 md:top-5" />
              <CornerOrnament className="bottom-3.5 right-3.5 rotate-180 md:bottom-5 md:right-5" />
              <CornerOrnament className="bottom-3.5 left-3.5 -rotate-90 md:bottom-5 md:left-5" />

              <div className="relative bg-black-cherry/35 px-6 py-[clamp(1.25rem,5.5svh,4.5rem)] text-center backdrop-blur-[2px] md:px-16">
                <Crest />

                <p className="eyebrow mt-[clamp(1rem,2.6svh,2rem)] flex items-center justify-center gap-4 text-gold">
                  <span className="h-px w-10 bg-gold/60" aria-hidden />
                  Start planning
                  <span className="h-px w-10 bg-gold/60" aria-hidden />
                </p>

                <SplitHeadline
                  as="h2"
                  trigger="view"
                  className="mx-auto mt-[clamp(0.75rem,2.2svh,1.75rem)] max-w-4xl font-serif text-[clamp(1.95rem,min(5.4svh,9vw),3rem)] leading-[1.04] md:text-[clamp(2.75rem,min(7.2svh,7vw),5.25rem)]"
                  segments={[
                    { text: "Let’s make your next celebration" },
                    { text: "unforgettable.", className: "italic text-champagne" },
                  ]}
                />

                <p className="mx-auto mt-[clamp(0.75rem,2.2svh,1.75rem)] max-w-xl text-[0.9375rem] leading-relaxed text-champagne/80 md:text-lg">
                  From the first idea to the last song, find everything you need to create moments that last.
                </p>

                <div className="mt-[clamp(1.25rem,3.6svh,2.75rem)] grid gap-2.5 sm:flex sm:flex-wrap sm:justify-center sm:gap-3 [&>a]:max-sm:h-11">
                  <Link href="/search" className={cn(buttonVariants({ variant: "gold", size: "xl" }))}>
                    Explore services <ArrowRight className="size-4" />
                  </Link>
                  <Link href="/vendor/onboarding" className={cn(buttonVariants({ variant: "outline-light", size: "xl" }))}>
                    Get started as a vendor
                  </Link>
                </div>

                <ul className="mt-[clamp(1.25rem,3.6svh,3rem)] flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-gold/20 pt-[clamp(1rem,2.8svh,2rem)] text-xs text-champagne/75 sm:gap-0 sm:text-sm">
                  {PROMISES.map((promise, i) => (
                    <li key={promise} className="flex items-center">
                      {i > 0 && <span aria-hidden className="mr-3 size-1 rotate-45 bg-gold sm:mx-5 sm:size-1.5" />}
                      {promise}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </Spotlight>
    </section>
  );
}
