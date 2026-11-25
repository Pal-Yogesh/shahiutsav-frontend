import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminGate } from "./_components/admin-gate";
import { AdminNav } from "./_components/admin-nav";

// Signed-in admin area: content waits for the session, so it is not prerendered
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[80svh] bg-ivory">
      <div className="border-b border-champagne/70 bg-white/60">
        <div className="shell">
          <Suspense fallback={<div className="h-12" />}>
            <AdminNav />
          </Suspense>
        </div>
      </div>
      <AdminGate>{children}</AdminGate>
    </div>
  );
}
