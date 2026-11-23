import { Suspense } from "react";
import type { Metadata } from "next";
import { VendorQueue } from "./_components/vendor-queue";

// Signed-in admin area: content waits for the session, so it is not prerendered
export const instant = false;

export const metadata: Metadata = { title: "Vendor applications" };

function PageSkeleton() {
  return (
    <div className="shell py-10 md:py-14" aria-busy>
      <div className="h-4 w-24 bg-champagne/60" />
      <div className="mt-4 h-11 w-80 max-w-full bg-champagne/40" />
      <div className="mt-10 h-72 border border-champagne bg-white" />
    </div>
  );
}

export default function AdminVendorsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <VendorQueue />
    </Suspense>
  );
}
