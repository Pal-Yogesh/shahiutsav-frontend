import type { Metadata } from "next";
import { PendingUpdates } from "./_components/pending-updates";

// Signed-in admin area: content waits for the session, so it is not prerendered
export const instant = false;

export const metadata: Metadata = { title: "Listing updates" };

export default function AdminUpdatesPage() {
  return <PendingUpdates />;
}
