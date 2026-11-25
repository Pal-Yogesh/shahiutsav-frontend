import type { Metadata } from "next";
import { BookingDetail } from "../../_components/booking-detail";

export const instant = false;
export const metadata: Metadata = { title: "Booking" };

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookingDetail id={id} />;
}
