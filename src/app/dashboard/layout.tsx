import type { Metadata } from "next";

// Signed-in area: content waits for the session, so it is not prerendered
export const instant = false;

export const metadata: Metadata = {
  title: { default: "My bookings", template: "%s | My bookings" },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[80svh] bg-ivory">{children}</div>;
}
