import type { Metadata } from "next";
import Link from "next/link";
import { AdminGate } from "./_components/admin-gate";

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
        <div className="shell flex h-12 items-center gap-6 text-sm">
          <span className="eyebrow text-[0.6rem] text-gold-deep">Admin</span>
          <Link href="/admin/vendors" className="link-draw text-charcoal/80 hover:text-burgundy">
            Vendor applications
          </Link>
        </div>
      </div>
      <AdminGate>{children}</AdminGate>
    </div>
  );
}
