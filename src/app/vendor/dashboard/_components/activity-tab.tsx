"use client";

import { History } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/config/vendor";
import { useDashboard } from "./vendor-dashboard";

// Colour hint per kind of change
function dot(type: string) {
  if (/APPROVED|ADDED|RESUMED/.test(type)) return "bg-emerald-600";
  if (/DECLINED|REMOVED|PAUSED/.test(type)) return "bg-burgundy";
  if (/REQUESTED/.test(type)) return "bg-gold";
  return "bg-charcoal/40";
}

export function ActivityTab() {
  const { data } = useDashboard();

  return (
    <section className="mx-auto max-w-3xl border border-champagne bg-white p-6 sm:p-10">
      <h2 className="font-serif text-3xl text-charcoal">Activity</h2>
      <p className="mt-1 text-sm text-muted-grey">Every change to your listing, by you or our team.</p>

      {data.activity.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <History className="size-10 text-champagne" strokeWidth={1.25} />
          <p className="mt-4 text-sm text-muted-grey">Nothing yet. Changes you make will be listed here.</p>
        </div>
      ) : (
        <ol className="mt-8">
          {data.activity.map((a, i) => (
            <li key={a.id} className="relative pb-6 pl-7 last:pb-0">
              {i < data.activity.length - 1 && <span aria-hidden className="absolute left-[5px] top-3 h-full w-px bg-champagne" />}
              <span aria-hidden className={cn("absolute left-0 top-1.5 size-[11px] rounded-full border-2 border-white", dot(a.type))} />
              <p className="text-sm text-charcoal">{a.summary}</p>
              <p className="mt-0.5 text-xs text-muted-grey">
                {formatDate(a.createdAt, true)} · {a.actor?.role === "admin" ? "ShahiUtsav team" : (a.actor?.name ?? "You")}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
