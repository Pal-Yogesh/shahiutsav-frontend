import { Suspense } from "react";
import type { Metadata } from "next";
import { apiGet } from "@/lib/api";
import { FALLBACK_CATEGORIES, FALLBACK_CITIES, orFallback } from "@/data/fallback";
import type { CategoryDTO, CityDTO } from "@/types";
import { VendorDashboard } from "./_components/vendor-dashboard";

// Signed-in area: content waits for the session, so it is not prerendered
export const instant = false;

export const metadata: Metadata = {
  title: "Your business",
  robots: { index: false, follow: false },
};

async function Dashboard() {
  const [categories, cities] = await Promise.all([apiGet<CategoryDTO[]>("/api/categories", 3600), apiGet<CityDTO[]>("/api/cities", 3600)]);
  return <VendorDashboard categories={orFallback(categories.data, FALLBACK_CATEGORIES)} cities={orFallback(cities.data, FALLBACK_CITIES)} />;
}

export default function VendorDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-[80svh] bg-ivory" />}>
      <Dashboard />
    </Suspense>
  );
}
