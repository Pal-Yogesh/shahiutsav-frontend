"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import { BadgeCheck, CheckCircle2, ExternalLink, Loader2, Store } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { clientApi, type ClientResult } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import { VISIBILITY_META } from "@/config/vendor";
import type { CategoryDTO, CityDTO, VendorDashboardDTO } from "@/types";
import { OverviewTab } from "./overview-tab";
import { ServicesTab } from "./services-tab";
import { ProfileTab } from "./profile-tab";
import { ActivityTab } from "./activity-tab";
import { BookingsTab } from "./bookings-tab";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "bookings", label: "Bookings" },
  { id: "services", label: "Services & prices" },
  { id: "profile", label: "Business profile" },
  { id: "activity", label: "Activity" },
] as const;
export type TabId = (typeof TABS)[number]["id"];

type Ctx = {
  data: VendorDashboardDTO;
  categories: CategoryDTO[];
  cities: CityDTO[];
  readOnly: boolean;
  // Calls the vendor API; on success the dashboard refreshes from the response
  act: (path: string, method: string, body?: unknown, success?: string) => Promise<ClientResult<VendorDashboardDTO>>;
  goTo: (tab: TabId) => void;
};
const DashboardContext = createContext<Ctx | null>(null);
export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside VendorDashboard");
  return ctx;
}

type Load = { state: "loading" } | { state: "error"; status: number; message: string } | { state: "ready"; data: VendorDashboardDTO };

export function VendorDashboard({ categories, cities }: { categories: CategoryDTO[]; cities: CityDTO[] }) {
  const { data: session, isPending } = useSession();
  const userId = session?.user.id;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const tab = (TABS.find((t) => t.id === params.get("tab"))?.id ?? "overview") as TabId;
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!userId) return;
    const ctrl = new AbortController();
    clientApi<VendorDashboardDTO>("/api/vendor-portal/dashboard", { signal: ctrl.signal })
      .then((res) => setLoad(res.ok ? { state: "ready", data: res.data } : { state: "error", status: res.status, message: res.error }))
      .catch(() => {});
    return () => ctrl.abort();
  }, [userId]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  const act = useCallback<Ctx["act"]>(async (path, method, body, success = "Saved") => {
    const res = await clientApi<VendorDashboardDTO>(`/api/vendor-portal${path}`, { method, body });
    if (res.ok) {
      setLoad({ state: "ready", data: res.data });
      setToast(success);
    }
    return res;
  }, []);

  const goTo = useCallback(
    (t: TabId) => {
      router.replace(t === "overview" ? pathname : `${pathname}?tab=${t}`, { scroll: false });
    },
    [router, pathname]
  );

  if (isPending || (session && load.state === "loading")) {
    return (
      <div className="flex min-h-[70svh] items-center justify-center bg-ivory" role="status">
        <Loader2 className="size-6 animate-spin text-gold-deep" />
        <span className="sr-only">Loading your dashboard</span>
      </div>
    );
  }

  if (!session || (load.state === "error" && load.status === 404)) {
    return (
      <div className="flex min-h-[70svh] items-center justify-center bg-ivory px-5">
        <div className="max-w-md text-center">
          <Store className="mx-auto size-10 text-burgundy" strokeWidth={1.5} />
          <h1 className="mt-5 font-serif text-3xl text-charcoal">{session ? "Your dashboard isn't open yet" : "Sign in to your business"}</h1>
          <p className="mt-3 text-sm text-muted-grey">
            {session ? "It opens as soon as your partner application is approved." : "Sign in with the email you used to apply."}
          </p>
          <Link
            href={session ? "/vendor/onboarding" : `/login?next=${encodeURIComponent("/vendor/dashboard")}`}
            className={cn(buttonVariants({ variant: "burgundy", size: "xl" }), "mt-8")}
          >
            {session ? "View your application" : "Sign in"}
          </Link>
        </div>
      </div>
    );
  }

  if (load.state === "error") {
    return <p className="min-h-[60svh] bg-ivory py-32 text-center text-sm text-burgundy">{load.message}</p>;
  }
  if (load.state !== "ready") return null;

  const { data } = load;
  const p = data.profile;
  const visibility = VISIBILITY_META[data.visibility];

  return (
    <DashboardContext.Provider value={{ data, categories, cities, readOnly: data.visibility === "suspended", act, goTo }}>
      <div className="min-h-[80svh] bg-ivory">
        {/* Header */}
        <section className="grain relative overflow-hidden bg-burgundy text-ivory">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-gold/20 blur-[120px]" />
          <div className="shell relative flex flex-col gap-6 pt-10 md:flex-row md:items-end md:justify-between md:pt-14">
            <div className="flex items-center gap-5">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/40 bg-black-cherry font-serif text-2xl text-champagne">
                {p.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element -- vendor-supplied link
                  <img src={p.profileImage} alt="" className="size-full object-cover" />
                ) : (
                  p.businessName[0]
                )}
              </div>
              <div className="min-w-0">
                <p className="eyebrow text-[0.6rem] text-gold">Your business</p>
                <h1 className="mt-1 flex items-center gap-2 font-serif text-3xl leading-tight md:text-4xl">
                  <span className="truncate">{p.businessName}</span>
                  {p.isVerified && <BadgeCheck className="size-6 shrink-0 text-gold" aria-label="Verified" />}
                </h1>
                <p className="mt-1 text-sm text-champagne/75">
                  {p.city.name}, {p.city.state}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 pb-1">
              <span className={cn("inline-flex items-center gap-2 border bg-white px-3 py-1.5 text-xs font-medium", visibility.tone)}>
                <span className={cn("size-1.5 rounded-full", visibility.dot)} /> {visibility.label}
              </span>
              {data.visibility === "live" && (
                <Link href={`/vendors/${p.slug}`} target="_blank" className="link-draw inline-flex items-center gap-1.5 text-sm text-champagne hover:text-ivory">
                  View public listing <ExternalLink className="size-3.5" />
                </Link>
              )}
            </div>
          </div>

          <nav className="shell relative mt-8 flex gap-1 overflow-x-auto" role="tablist" aria-label="Dashboard sections">
            {TABS.map((t) => {
              const active = t.id === tab;
              const badge = t.id === "bookings" ? data.stats.bookingRequests : t.id === "services" ? data.stats.pendingServices : t.id === "profile" && data.pendingChange ? 1 : 0;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => goTo(t.id)}
                  className={cn(
                    "relative flex shrink-0 items-center gap-2 px-4 py-3.5 text-sm transition-colors",
                    active ? "bg-ivory text-burgundy" : "text-champagne/80 hover:text-ivory"
                  )}
                >
                  {t.label}
                  {badge > 0 &&
                    (t.id === "bookings" ? (
                      <span className="min-w-5 bg-gold px-1.5 text-center text-[0.68rem] leading-5 text-charcoal" aria-label={`${badge} new requests`}>
                        {badge}
                      </span>
                    ) : (
                      <span className="size-1.5 rounded-full bg-gold" aria-label="Has items under review" />
                    ))}
                </button>
              );
            })}
          </nav>
        </section>

        {data.visibility === "suspended" && (
          <div className="shell pt-8">
            <p className="border-l-2 border-burgundy bg-burgundy/[0.05] px-4 py-3 text-sm text-burgundy">
              Your listing is suspended, so editing is paused. {data.notes[0]?.note ? `Note from our team: ${data.notes[0].note}` : "Please contact our team."}
            </p>
          </div>
        )}

        <div className="shell py-10 md:py-12">
          {tab === "overview" && <OverviewTab />}
          {tab === "bookings" && <BookingsTab />}
          {tab === "services" && <ServicesTab />}
          {tab === "profile" && <ProfileTab />}
          {tab === "activity" && <ActivityTab />}
        </div>

        <AnimatePresence>
          {toast && (
            <m.div
              role="status"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 bg-charcoal px-5 py-3 text-sm text-ivory shadow-xl"
            >
              <CheckCircle2 className="size-4 text-gold" /> {toast}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardContext.Provider>
  );
}
