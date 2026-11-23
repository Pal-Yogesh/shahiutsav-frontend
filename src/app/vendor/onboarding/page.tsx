import { Suspense } from "react";
import type { Metadata } from "next";
import { apiGet } from "@/lib/api";
import { APP_NAME } from "@/config/constants";
import { FALLBACK_CATEGORIES, FALLBACK_CITIES, orFallback } from "@/data/fallback";
import type { CategoryDTO, CityDTO } from "@/types";
import { OnboardingExperience } from "./_components/onboarding-experience";

export const metadata: Metadata = {
  title: "Become a Partner",
  description: `List your event business on ${APP_NAME}: DJs, décor, photography, catering, sound, lighting and more.`,
};

async function Onboarding() {
  const [categories, cities] = await Promise.all([apiGet<CategoryDTO[]>("/api/categories", 3600), apiGet<CityDTO[]>("/api/cities", 3600)]);
  return <OnboardingExperience categories={orFallback(categories.data, FALLBACK_CATEGORIES)} cities={orFallback(cities.data, FALLBACK_CITIES)} />;
}

export default function VendorOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-[80svh] bg-ivory" />}>
      <Onboarding />
    </Suspense>
  );
}
