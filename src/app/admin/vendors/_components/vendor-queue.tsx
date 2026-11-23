"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Inbox, Loader2, Search } from "lucide-react";
import { clientApi } from "@/lib/client-api";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { ADMIN_TABS, STATUS_META, formatDate } from "@/config/vendor";
import type { AdminVendorListItem, PaginationMeta, VendorStatus } from "@/types";

type ListState =
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; rows: AdminVendorListItem[]; meta: PaginationMeta };

export function VendorQueue() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const status = (params.get("status") as VendorStatus | null) ?? "SUBMITTED";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const urlQuery = params.get("q") ?? "";

  const [query, setQuery] = useState(urlQuery);
  const debounced = useDebounce(query, 350);
  const [counts, setCounts] = useState<Record<VendorStatus, number> | null>(null);
  const [list, setList] = useState<ListState>({ state: "loading" });

  function setParams(next: { status?: VendorStatus; page?: number; q?: string }) {
    const sp = new URLSearchParams(params.toString());
    if (next.status) sp.set("status", next.status);
    if (next.q) sp.set("q", next.q);
    else if (next.q !== undefined) sp.delete("q");
    if (next.page && next.page > 1) sp.set("page", String(next.page));
    else sp.delete("page");
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  // Push the debounced search into the URL
  useEffect(() => {
    if (debounced !== urlQuery) setParams({ q: debounced, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the typed query
  }, [debounced]);

  useEffect(() => {
    const ctrl = new AbortController();
    clientApi<Record<VendorStatus, number>>("/api/admin/vendors/summary", { signal: ctrl.signal })
      .then((res) => res.ok && setCounts(res.data))
      .catch(() => {});
    return () => ctrl.abort();
  }, [status]);

  useEffect(() => {
    const ctrl = new AbortController();
    const sp = new URLSearchParams({ status, page: String(page) });
    if (urlQuery) sp.set("q", urlQuery);
    clientApi<AdminVendorListItem[]>(`/api/admin/vendors?${sp}`, { signal: ctrl.signal })
      .then((res) =>
        setList(res.ok ? { state: "ready", rows: res.data, meta: res.meta! } : { state: "error", message: res.error })
      )
      .catch(() => {});
    return () => ctrl.abort();
  }, [status, page, urlQuery]);

  return (
    <div className="shell py-10 md:py-14">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow text-gold-deep">Partners</p>
          <h1 className="mt-2 font-serif text-4xl text-charcoal md:text-5xl">Vendor applications</h1>
          <p className="mt-2 text-sm text-muted-grey">
            {counts ? `${counts.SUBMITTED} waiting for review` : "Loading…"}
            {counts && counts.DRAFT > 0 && ` · ${counts.DRAFT} started but not submitted`}
          </p>
        </div>
        <label className="relative block w-full md:w-80">
          <span className="sr-only">Search applications</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-grey" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Business, contact, phone or email"
            className="h-12 w-full border border-champagne bg-white pl-11 pr-4 text-sm outline-none transition-all focus:border-burgundy focus:shadow-[0_0_0_3px_rgba(101,30,45,0.10)]"
          />
        </label>
      </div>

      <div role="tablist" aria-label="Application status" className="mt-10 flex gap-1 overflow-x-auto border-b border-champagne">
        {ADMIN_TABS.map((s) => {
          const active = s === status;
          return (
            <button
              key={s}
              role="tab"
              aria-selected={active}
              onClick={() => {
                setList({ state: "loading" });
                setParams({ status: s, page: 1 });
              }}
              className={cn(
                "relative flex shrink-0 items-center gap-2 px-4 pb-3 pt-2 text-sm transition-colors",
                active ? "text-burgundy" : "text-charcoal/65 hover:text-charcoal"
              )}
            >
              {STATUS_META[s].adminLabel}
              <span className={cn("min-w-6 px-1.5 py-0.5 text-center text-[0.7rem] tabular-nums", active ? "bg-burgundy text-ivory" : "bg-sand text-muted-grey")}>
                {counts?.[s] ?? "·"}
              </span>
              {active && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-burgundy" />}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {list.state === "loading" && (
          <div className="flex justify-center py-24" role="status">
            <Loader2 className="size-6 animate-spin text-gold-deep" />
          </div>
        )}
        {list.state === "error" && <p className="py-16 text-center text-sm text-burgundy">{list.message}</p>}
        {list.state === "ready" && list.rows.length === 0 && (
          <div className="flex flex-col items-center py-24 text-center">
            <Inbox className="size-10 text-champagne" strokeWidth={1.25} />
            <p className="mt-4 font-serif text-2xl text-charcoal">{urlQuery ? "No matches" : "Nothing here"}</p>
            <p className="mt-1 text-sm text-muted-grey">
              {urlQuery ? "Try a different search." : status === "SUBMITTED" ? "You're all caught up." : "No applications in this state."}
            </p>
          </div>
        )}
        {list.state === "ready" && list.rows.length > 0 && (
          <>
            <ul className="divide-y divide-champagne/70 border border-champagne bg-white">
              {list.rows.map((v) => (
                <li key={v.id}>
                  <Link
                    href={`/admin/vendors/${v.id}`}
                    className="group grid gap-3 px-5 py-4 transition-colors hover:bg-ivory md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.6fr)_8rem_1.5rem] md:items-center md:gap-6"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-charcoal group-hover:text-burgundy">{v.businessName}</p>
                      <p className="truncate text-xs text-muted-grey">
                        {v.contactName ?? "No contact name"} · {v.city}
                      </p>
                    </div>
                    <div className="min-w-0 text-xs text-muted-grey">
                      <p className="truncate">{v.email}</p>
                      <p>{v.phone ? `+91 ${v.phone}` : "No phone yet"}</p>
                    </div>
                    <div className="flex min-w-0 flex-wrap gap-1.5">
                      {v.categories.length ? (
                        v.categories.slice(0, 3).map((c) => (
                          <span key={c} className="bg-sand px-2 py-0.5 text-[0.7rem] text-charcoal/80">
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-grey">No services yet</span>
                      )}
                      {v.categories.length > 3 && <span className="text-[0.7rem] text-muted-grey">+{v.categories.length - 3}</span>}
                    </div>
                    <div className="text-xs text-muted-grey">
                      <p>{status === "SUBMITTED" ? "Submitted" : "Updated"}</p>
                      <p className="text-charcoal/80">{formatDate(status === "SUBMITTED" ? v.submittedAt : v.updatedAt)}</p>
                    </div>
                    <ChevronRight className="hidden size-4 text-muted-grey transition-transform group-hover:translate-x-1 group-hover:text-burgundy md:block" />
                  </Link>
                </li>
              ))}
            </ul>

            {list.meta.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between text-sm">
                <p className="text-muted-grey">
                  Page {list.meta.page} of {list.meta.totalPages} · {list.meta.total} applications
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setParams({ page: page - 1 })}
                    className="flex size-10 items-center justify-center border border-champagne bg-white disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={page >= list.meta.totalPages}
                    onClick={() => setParams({ page: page + 1 })}
                    className="flex size-10 items-center justify-center border border-champagne bg-white disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
