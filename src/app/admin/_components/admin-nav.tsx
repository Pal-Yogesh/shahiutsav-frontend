"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { clientApi } from "@/lib/client-api";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin/vendors", label: "Vendor applications", count: "applications" },
  { href: "/admin/updates", label: "Listing updates", count: "updates" },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "admin";
  const [counts, setCounts] = useState<{ applications: number; updates: number } | null>(null);

  // Refresh the badges whenever the admin moves between pages
  useEffect(() => {
    if (!isAdmin) return;
    const ctrl = new AbortController();
    Promise.all([
      clientApi<Record<string, number>>("/api/admin/vendors/summary", { signal: ctrl.signal }),
      clientApi<{ total: number }>("/api/admin/updates/count", { signal: ctrl.signal }),
    ])
      .then(([a, u]) => setCounts({ applications: a.ok ? a.data.SUBMITTED : 0, updates: u.ok ? u.data.total : 0 }))
      .catch(() => {});
    return () => ctrl.abort();
  }, [isAdmin, pathname]);

  return (
    <nav className="flex h-12 items-center gap-6 overflow-x-auto text-sm">
      <span className="eyebrow shrink-0 text-[0.6rem] text-gold-deep">Admin</span>
      {LINKS.map((l) => {
        const n = counts?.[l.count] ?? 0;
        const active = pathname.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} className={cn("link-draw flex shrink-0 items-center gap-2", active ? "text-burgundy" : "text-charcoal/75 hover:text-burgundy")}>
            {l.label}
            {n > 0 && <span className="min-w-5 bg-burgundy px-1.5 text-center text-[0.68rem] leading-5 text-ivory">{n}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
