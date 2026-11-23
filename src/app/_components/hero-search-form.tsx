"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronDown, MapPin, PartyPopper, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OCCASIONS } from "@/data/homepage";
import { useHeroOccasion } from "@/app/_components/hero-occasion";
import type { CategoryDTO, CityDTO } from "@/types";

type Props = {
  cities: CityDTO[];
  categories: CategoryDTO[];
};

function Field({
  label,
  icon: Icon,
  children,
  className,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "group relative flex min-w-0 cursor-pointer flex-col gap-1.5 px-4 py-3.5 transition-colors duration-300 hover:bg-sand focus-within:bg-sand md:px-5 md:py-4",
        className
      )}
    >
      <span className="eyebrow flex items-center gap-1.5 text-[0.6rem] text-gold-deep">
        <Icon className="size-3" strokeWidth={2} />
        {label}
      </span>
      {children}
      {/* Burgundy underline grows in while the field is focused */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-burgundy transition-transform duration-500 group-focus-within:scale-x-100" />
    </label>
  );
}

const selectClass =
  "w-full cursor-pointer appearance-none truncate bg-transparent pr-6 text-sm font-medium text-charcoal outline-none";

function Chevron() {
  return <ChevronDown className="pointer-events-none absolute bottom-4 right-4 size-4 text-muted-grey md:bottom-4.5 md:right-5" />;
}

// Today as YYYY-MM-DD in the visitor's own timezone
function localToday() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function HeroSearchForm({ cities, categories }: Props) {
  const router = useRouter();
  const hero = useHeroOccasion();
  const [localOccasion, setLocalOccasion] = useState("");
  // Inside the hero the occasion is shared with the banner; elsewhere it is local
  const occasion = hero ? hero.chosen : localOccasion;
  const setOccasion = hero ? hero.choose : setLocalOccasion;
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (occasion) params.set("q", occasion);
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    if (date) params.set("date", date);
    router.push(`/search${params.size ? `?${params}` : ""}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Find vendors for your event"
      className="grid grid-cols-2 rounded-[2px] bg-ivory p-1.5 text-charcoal shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:divide-x lg:divide-champagne"
    >
      <Field label="Occasion" icon={PartyPopper} className="border-b border-r border-champagne lg:border-0">
        <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className={selectClass}>
          <option value="">Any occasion</option>
          {OCCASIONS.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
        <Chevron />
      </Field>

      <Field label="City" icon={MapPin} className="border-b border-champagne lg:border-0">
        <select value={city} onChange={(e) => setCity(e.target.value)} className={selectClass}>
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <Chevron />
      </Field>

      <Field label="Event date" icon={CalendarDays} className="border-r border-champagne lg:border-0">
        <input
          type="date"
          value={date}
          // Past dates are blocked; set on focus so server and client markup match
          onFocus={(e) => (e.currentTarget.min = localToday())}
          onChange={(e) => setDate(e.target.value)}
          className={cn(
            "w-full cursor-pointer bg-transparent text-sm font-medium outline-none [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-50",
            date ? "text-charcoal" : "text-muted-grey"
          )}
        />
      </Field>

      <Field label="Service" icon={Sparkles}>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
          <option value="">All services</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <Chevron />
      </Field>

      <div className="col-span-2 flex items-stretch pt-1.5 lg:col-span-1 lg:pt-0">
        <Button type="submit" variant="burgundy" size="xl" className="h-auto min-h-13 w-full lg:w-auto lg:px-9">
          <Search className="size-4" />
          Find your match
        </Button>
      </div>
    </form>
  );
}
