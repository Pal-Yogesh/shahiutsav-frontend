"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { ArrowRight, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import { PRICE_TYPES, formatINR, timeAgo } from "@/config/vendor";
import type { AdminPendingUpdates } from "@/types";

type Load = { state: "loading" } | { state: "error"; message: string } | { state: "ready"; data: AdminPendingUpdates };

const FIELD_LABELS: Record<string, string> = { businessName: "Business name", cityId: "City", gstNumber: "GSTIN" };

export function PendingUpdates() {
  const [load, setLoad] = useState<Load>({ state: "loading" });

  useEffect(() => {
    const ctrl = new AbortController();
    clientApi<AdminPendingUpdates>("/api/admin/updates", { signal: ctrl.signal })
      .then((res) => setLoad(res.ok ? { state: "ready", data: res.data } : { state: "error", message: res.error }))
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  const total = load.state === "ready" ? load.data.services.length + load.data.changes.length : 0;

  return (
    <div className="shell py-10 md:py-14">
      <p className="eyebrow text-gold-deep">Live listings</p>
      <h1 className="mt-2 font-serif text-4xl text-charcoal md:text-5xl">Listing updates</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-grey">
        Approved vendors asking to offer a new category, or to change their business name, city or GSTIN. Price and description changes don&apos;t need review.
      </p>

      {load.state === "loading" && (
        <div className="flex justify-center py-24" role="status">
          <Loader2 className="size-6 animate-spin text-gold-deep" />
        </div>
      )}
      {load.state === "error" && <p className="py-16 text-center text-sm text-burgundy">{load.message}</p>}

      {load.state === "ready" && total === 0 && (
        <div className="flex flex-col items-center py-24 text-center">
          <Inbox className="size-10 text-champagne" strokeWidth={1.25} />
          <p className="mt-4 font-serif text-2xl text-charcoal">You&apos;re all caught up</p>
          <p className="mt-1 text-sm text-muted-grey">New requests from vendors will appear here.</p>
        </div>
      )}

      {load.state === "ready" && total > 0 && (
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <section>
            <h2 className="eyebrow text-[0.6rem] text-gold-deep">New categories · {load.data.services.length}</h2>
            <ul className="mt-4 space-y-4">
              <AnimatePresence initial={false}>
                {load.data.services.map((s) => (
                  <m.li key={s.id} layout exit={{ opacity: 0, x: 30 }} className="border border-champagne bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link href={`/admin/vendors/${s.vendor.id}`} className="link-draw text-sm font-medium text-charcoal hover:text-burgundy">
                          {s.vendor.businessName}
                        </Link>
                        <p className="text-xs text-muted-grey">
                          {s.vendor.city} · already offers {s.vendor.liveCategories.join(", ") || "nothing live"}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-grey">{timeAgo(s.submittedAt)}</span>
                    </div>
                    <div className="mt-4 border-l-2 border-gold pl-4">
                      <p className="text-xs uppercase tracking-wider text-gold-deep">Wants to add {s.category.name}</p>
                      <p className="mt-1 font-medium text-charcoal">{s.title}</p>
                      <p className="text-sm tabular-nums text-charcoal/80">
                        {formatINR(s.price)} <span className="text-xs text-muted-grey">{PRICE_TYPES.find((p) => p.value === s.priceType)?.suffix}</span>
                      </p>
                      {s.description && <p className="mt-1 text-sm text-muted-grey">{s.description}</p>}
                    </div>
                    <Decision
                      endpoint={`/api/admin/services/${s.id}/decision`}
                      approveLabel={`Approve ${s.category.name}`}
                      onDone={(data) => setLoad({ state: "ready", data })}
                    />
                  </m.li>
                ))}
              </AnimatePresence>
              {load.data.services.length === 0 && <li className="text-sm text-muted-grey">None waiting.</li>}
            </ul>
          </section>

          <section>
            <h2 className="eyebrow text-[0.6rem] text-gold-deep">Business detail changes · {load.data.changes.length}</h2>
            <ul className="mt-4 space-y-4">
              <AnimatePresence initial={false}>
                {load.data.changes.map((c) => (
                  <m.li key={c.id} layout exit={{ opacity: 0, x: 30 }} className="border border-champagne bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <Link href={`/admin/vendors/${c.vendor.id}`} className="link-draw text-sm font-medium text-charcoal hover:text-burgundy">
                        {c.vendor.businessName}
                      </Link>
                      <span className="shrink-0 text-xs text-muted-grey">{timeAgo(c.createdAt)}</span>
                    </div>
                    <dl className="mt-4 space-y-2 text-sm">
                      {Object.keys(FIELD_LABELS)
                        .filter((k) => k in c.changes)
                        .map((k) => (
                          <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-3">
                            <dt className="text-muted-grey">{FIELD_LABELS[k]}</dt>
                            <dd className="flex flex-wrap items-center gap-2">
                              <span className="text-charcoal/50 line-through">{c.previous[k] || "none"}</span>
                              <ArrowRight className="size-3.5 text-gold-deep" />
                              <span className="font-medium text-charcoal">{c.changes[k] || "removed"}</span>
                            </dd>
                          </div>
                        ))}
                    </dl>
                    {c.changes.reason && <p className="mt-3 border-l-2 border-champagne pl-3 text-xs italic text-muted-grey">“{c.changes.reason}”</p>}
                    <Decision endpoint={`/api/admin/change-requests/${c.id}/decision`} approveLabel="Approve change" onDone={(data) => setLoad({ state: "ready", data })} />
                  </m.li>
                ))}
              </AnimatePresence>
              {load.data.changes.length === 0 && <li className="text-sm text-muted-grey">None waiting.</li>}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}

function Decision({ endpoint, approveLabel, onDone }: { endpoint: string; approveLabel: string; onDone: (d: AdminPendingUpdates) => void }) {
  const [mode, setMode] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send(action: "approve" | "reject") {
    if (action === "reject" && !note.trim()) return setError("Tell the vendor why. They'll see this note.");
    setBusy(true);
    setError("");
    const res = await clientApi<AdminPendingUpdates>(endpoint, { method: "POST", body: { action, note } });
    setBusy(false);
    if (!res.ok) return setError(res.fieldErrors.note ?? res.error);
    onDone(res.data);
  }

  return (
    <div className="mt-5 border-t border-champagne/70 pt-4">
      {mode === "reject" ? (
        <div>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setError("");
            }}
            placeholder="Reason shared with the vendor"
            aria-label="Reason for declining"
            className="w-full resize-y border border-champagne bg-ivory/40 px-3 py-2 text-sm outline-none focus:border-burgundy"
          />
          {error && <p className="mt-1 text-xs text-burgundy">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setMode(null)} className="h-9 px-3 text-xs text-charcoal/70">
              Back
            </button>
            <Button variant="burgundy" className="h-9 rounded-[2px] px-4 text-xs" disabled={busy} onClick={() => send("reject")}>
              {busy && <Loader2 className="size-3.5 animate-spin" />} Decline
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setMode("approve");
              void send("approve");
            }}
            className={cn("inline-flex h-9 items-center gap-2 bg-emerald-700 px-4 text-xs font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-60")}
          >
            {busy && mode === "approve" && <Loader2 className="size-3.5 animate-spin" />} {approveLabel}
          </button>
          <button type="button" disabled={busy} onClick={() => setMode("reject")} className="h-9 border border-burgundy/30 px-4 text-xs font-medium text-burgundy hover:bg-burgundy/[0.04]">
            Decline
          </button>
          {error && <p className="w-full text-xs text-burgundy">{error}</p>}
        </div>
      )}
    </div>
  );
}
