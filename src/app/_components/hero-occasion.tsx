"use client";

import { createContext, useContext, useState } from "react";

// The occasion the visitor picked in the hero (banner tabs or the search form).
// Empty until they choose; while empty the banner keeps cycling on its own.
type HeroOccasion = { chosen: string; choose: (id: string) => void };

const HeroOccasionContext = createContext<HeroOccasion | null>(null);

export function HeroOccasionProvider({ children }: { children: React.ReactNode }) {
  const [chosen, choose] = useState("");
  return <HeroOccasionContext.Provider value={{ chosen, choose }}>{children}</HeroOccasionContext.Provider>;
}

// Null outside the hero, so components can fall back to their own state
export function useHeroOccasion() {
  return useContext(HeroOccasionContext);
}
