import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { SearchBar } from "@/components/shared/search-bar";
import { VendorCard } from "@/components/shared/vendor-card";
import { Pagination } from "@/components/shared/pagination";
import { VendorGridSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchFilters } from "@/app/search/_components/search-filters";
import { apiGet } from "@/lib/api";
import { APP_NAME } from "@/config/constants";
import type { SearchParams, CategoryDTO, CityDTO, VendorCardDTO } from "@/types";

export const metadata: Metadata = {
  title: "Find Vendors",
  description: `Search and compare event vendors on ${APP_NAME}`,
};

type Props = {
  searchParams: Promise<SearchParams>;
};

async function VendorResults({ searchParams }: Props) {
  const raw = await searchParams;
  const query = new URLSearchParams();
  if (raw.q) query.set("q", raw.q);
  if (raw.city) query.set("city", raw.city);
  if (raw.category) query.set("category", raw.category);
  if (raw.page) query.set("page", raw.page);
  if (raw.limit) query.set("limit", raw.limit);
  if (raw.sort) query.set("sort", raw.sort);

  const res = await apiGet<VendorCardDTO[]>(`/api/vendors?${query.toString()}`);
  const vendors = res.data ?? [];
  const meta = res.meta ?? { page: 1, limit: 12, total: 0, totalPages: 0 };

  if (vendors.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No vendors found"
        description="Try changing your search or filters."
      />
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">
        {meta.total} vendor{meta.total !== 1 ? "s" : ""} found
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
      </div>
      <div className="mt-8">
        <Pagination meta={meta} />
      </div>
    </>
  );
}

async function Filters() {
  const [catRes, cityRes] = await Promise.all([
    apiGet<CategoryDTO[]>("/api/categories"),
    apiGet<CityDTO[]>("/api/cities"),
  ]);

  return (
    <SearchFilters
      categories={catRes.data ?? []}
      cities={cityRes.data ?? []}
    />
  );
}

export default function SearchPage(props: Props) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mb-6">
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-56 shrink-0">
          <Suspense fallback={null}>
            <Filters />
          </Suspense>
        </aside>

        <div className="flex-1 min-w-0">
          <Suspense fallback={<VendorGridSkeleton count={6} />}>
            <VendorResults searchParams={props.searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
