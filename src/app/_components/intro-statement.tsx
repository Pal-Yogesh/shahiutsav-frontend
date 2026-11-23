import { Suspense } from "react";
import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/effects";
import { ScrollStatement } from "@/app/_components/intro-reveal";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";
import { INTRO_IMAGES } from "@/data/homepage";
import type { CategoryDTO, CityDTO } from "@/types";

// Toran arch from the logo, used as a large faint watermark
function ArchWatermark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={className}>
      <path d="M6 39V18C6 10.3 12.3 4 20 4s14 6.3 14 14v21" fill="none" stroke="currentColor" strokeWidth="0.35" />
      <path d="M9 39V18.5C9 12.4 13.9 7.5 20 7.5s11 4.9 11 11V39" fill="none" stroke="currentColor" strokeWidth="0.2" />
      <path d="M20 13l6 8-6 8-6-8z" fill="none" stroke="currentColor" strokeWidth="0.3" />
    </svg>
  );
}

// Only as many columns as there are stats, so no empty cells when data is missing
const COLS: Record<number, string> = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" };

// Counts come from the backend so the numbers are always true
async function PlatformStats() {
  const [categories, cities] = await Promise.all([
    apiGet<CategoryDTO[]>("/api/categories"),
    apiGet<CityDTO[]>("/api/cities"),
  ]);

  const stats = [
    { value: categories.data?.length ?? 0, eyebrow: "Services", label: "Categories, from DJs and décor to food and photography" },
    { value: cities.data?.length ?? 0, eyebrow: "Cities", label: "On our launch map, growing city by city" },
    { value: 1, eyebrow: "Booking", label: "For your entire event, every vendor on one date" },
  ].filter((s) => s.value > 0);

  return (
    <dl className={cn("mt-24 grid gap-px overflow-hidden border border-champagne bg-champagne md:mt-32", COLS[stats.length])}>
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 0.1} className="h-full">
          <div className="group relative h-full bg-ivory p-8 transition-colors duration-700 hover:bg-sand md:p-10">
            <span aria-hidden className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-gold transition-transform duration-700 group-hover:scale-x-100" />
            <dt className="eyebrow flex items-center gap-3 text-gold-deep">
              <span className="size-1.5 rotate-45 bg-gold" aria-hidden />
              {s.eyebrow}
            </dt>
            <dd className="mt-6 font-serif text-7xl leading-none text-burgundy lining-nums tabular-nums md:text-8xl">
              <CountUp value={s.value} />
            </dd>
            <p className="mt-4 max-w-[15rem] text-sm leading-relaxed text-muted-grey">{s.label}</p>
          </div>
        </Reveal>
      ))}
    </dl>
  );
}

export function IntroStatement() {
  return (
    <section className="relative overflow-hidden bg-ivory py-24 md:py-40">
      <ArchWatermark className="pointer-events-none absolute -right-40 top-16 hidden h-[34rem] w-[34rem] text-champagne/70 xl:block" />

      <div className="shell relative">
        <Reveal>
          <p className="eyebrow flex items-center gap-4 text-gold-deep">
            <span className="h-px w-10 bg-gold-deep/50" aria-hidden />
            One platform, every celebration
          </p>
        </Reveal>

        <ScrollStatement
          className="mt-10 max-w-5xl font-serif text-[2.2rem] leading-[1.28] text-charcoal md:text-6xl md:leading-[1.16] lg:text-[4.4rem]"
          tokens={[
            { type: "text", value: "One destination for the" },
            { type: "feature", word: "music", src: INTRO_IMAGES.dj, alt: "DJ performing for a crowd", suffix: "," },
            { type: "text", value: "the" },
            { type: "feature", word: "décor", src: INTRO_IMAGES.decor, alt: "Floral wedding décor" },
            { type: "text", value: "and the" },
            { type: "feature", word: "food", src: INTRO_IMAGES.food, alt: "Indian curries served at an event", suffix: "." },
            { type: "text", value: "Everything an Indian celebration needs, from professionals near you.", muted: true },
          ]}
        />

        <Suspense fallback={<div className="mt-24 h-56 border border-champagne md:mt-32" />}>
          <PlatformStats />
        </Suspense>
      </div>
    </section>
  );
}
