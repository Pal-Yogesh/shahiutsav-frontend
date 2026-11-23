import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/api";
import { Spotlight } from "@/components/motion/spotlight";
import { cn } from "@/lib/utils";
import type { CategoryDTO } from "@/types";
import { FALLBACK_CATEGORIES, orFallback } from "@/data/fallback";

// Editorial rhythm: one hero tile, singles, then wide tiles. Repeats if more categories are added.
const TILE_SPANS = [
  "col-span-2 lg:row-span-2",
  "",
  "",
  "",
  "",
  "lg:col-span-2",
  "",
  "",
  "lg:col-span-2",
];

const GRID = "grid grid-flow-dense auto-rows-[200px] grid-cols-2 gap-3 md:auto-rows-[240px] md:gap-4 lg:grid-cols-4";

function CategoryTile({ category, index }: { category: CategoryDTO; index: number }) {
  const span = TILE_SPANS[index % TILE_SPANS.length];
  const isFeature = index % TILE_SPANS.length === 0;

  return (
    <Reveal className={cn("h-full", span)} delay={(index % 4) * 0.06}>
      <Link
        href={`/search?category=${category.slug}`}
        className="group relative flex h-full flex-col justify-between overflow-hidden bg-burgundy p-5 text-ivory md:p-7"
      >
        {category.image ? (
          <Image
            src={category.image}
            alt=""
            fill
            sizes={isFeature ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
            className="-z-0 photo-grade object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-wine to-burgundy" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/25 to-charcoal/10 transition-colors duration-500 group-hover:from-burgundy/95" />

        <div className="relative flex items-start justify-between">
          <span className="font-serif text-base italic text-gold">{String(index + 1).padStart(2, "0")}</span>
          <span className="flex size-10 items-center justify-center rounded-full border border-ivory/40 transition-all duration-500 group-hover:rotate-45 group-hover:border-gold group-hover:bg-gold group-hover:text-charcoal">
            <ArrowUpRight className="size-4" />
          </span>
        </div>

        <div className="relative">
          <h3 className={cn("font-serif leading-tight", isFeature ? "text-4xl md:text-6xl" : "text-2xl md:text-3xl")}>
            {category.name}
          </h3>
          {category.description && (
            <p
              className={cn(
                "mt-2 text-sm text-champagne/80",
                isFeature ? "max-w-sm md:text-base" : "line-clamp-2 hidden md:block md:max-h-0 md:opacity-0 md:transition-all md:duration-500 md:group-hover:max-h-12 md:group-hover:opacity-100"
              )}
            >
              {category.description}
            </p>
          )}
        </div>
      </Link>
    </Reveal>
  );
}

async function CategoryGrid() {
  const res = await apiGet<CategoryDTO[]>("/api/categories");
  const categories = orFallback(res.data, FALLBACK_CATEGORIES);

  return (
    <Spotlight layer="over" size={420} className={cn(GRID, "relative mt-14")}>
      {categories.map((category, i) => (
        <CategoryTile key={category.id} category={category} index={i} />
      ))}
      <Reveal className="col-span-2 h-full">
        <Link
          href="#occasions"
          className="group flex h-full flex-col justify-between border border-champagne bg-sand p-7 transition-colors duration-500 hover:border-burgundy"
        >
          <Sparkles className="size-6 text-gold-deep" strokeWidth={1.5} />
          <div>
            <p className="font-serif text-3xl text-charcoal md:text-4xl">Not sure where to start?</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-burgundy">
              Plan by occasion
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </p>
          </div>
        </Link>
      </Reveal>
    </Spotlight>
  );
}

function CategoryGridSkeleton() {
  return (
    <div className={cn(GRID, "mt-14")}>
      {TILE_SPANS.map((span, i) => (
        <Skeleton key={i} className={cn("h-full rounded-[2px] bg-champagne/40", span)} />
      ))}
    </div>
  );
}

export function ServicesBento() {
  return (
    <section id="services" className="bg-ivory pb-24 md:pb-32">
      <div className="shell">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Explore services"
            title={<>Everything your event needs. <em className="text-wine">All in one place.</em></>}
          />
          <Link
            href="/search"
            className="group flex shrink-0 items-center gap-2 text-sm font-semibold text-burgundy"
          >
            View all vendors
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
        <Suspense fallback={<CategoryGridSkeleton />}>
          <CategoryGrid />
        </Suspense>
      </div>
    </section>
  );
}
