import { Suspense } from "react";
import Link from "next/link";
import { HeroSearchForm } from "@/app/_components/hero-search-form";
import { HeroShowcase } from "@/app/_components/hero-showcase";
import { HeroOccasionProvider } from "@/app/_components/hero-occasion";
import { apiGet } from "@/lib/api";
import { HERO, MARQUEE } from "@/data/homepage";
import type { CategoryDTO, CityDTO } from "@/types";
import { FALLBACK_CATEGORIES, FALLBACK_CITIES, orFallback } from "@/data/fallback";

async function HeroSearch() {
  const [cities, categories] = await Promise.all([
    apiGet<CityDTO[]>("/api/cities"),
    apiGet<CategoryDTO[]>("/api/categories"),
  ]);
  return (
    <HeroSearchForm
      cities={orFallback(cities.data, FALLBACK_CITIES)}
      categories={orFallback(categories.data, FALLBACK_CATEGORIES)}
    />
  );
}

// Same footprint as the form, so nothing shifts when it streams in
function HeroSearchSkeleton() {
  return <div className="h-[214px] rounded-[2px] bg-ivory/90 lg:h-[84px]" />;
}

function Marquee() {
  const items = [...MARQUEE, ...MARQUEE];
  return (
    <div className="group/marquee relative border-t border-ivory/10 bg-charcoal/60 py-5">
      <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max gap-10 motion-safe:animate-marquee group-hover/marquee:[animation-play-state:paused]">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-10 font-serif text-2xl italic text-champagne/75">
              {item}
              <span className="text-[10px] not-italic text-gold" aria-hidden>◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PopularSearches() {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <span className="eyebrow text-champagne/50">Popular</span>
      {HERO.popular.map((p) => (
        <Link key={p.label} href={p.href} className="link-draw pb-0.5 text-ivory/80 transition-colors hover:text-gold">
          {p.label}
        </Link>
      ))}
    </div>
  );
}

// Interactive banner (client) with the server-rendered search inside it.
// The provider lets the banner and the search form share the chosen occasion.
export function Hero() {
  return (
    <HeroOccasionProvider>
      <HeroShowcase
        search={
          <Suspense fallback={<HeroSearchSkeleton />}>
            <HeroSearch />
          </Suspense>
        }
        popular={<PopularSearches />}
        marquee={<Marquee />}
      />
    </HeroOccasionProvider>
  );
}
