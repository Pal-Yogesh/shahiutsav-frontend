import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Phone, BadgeCheck, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { ServiceCard } from "@/components/shared/service-card";
import { apiGet } from "@/lib/api";
import { APP_NAME } from "@/config/constants";
import { cn } from "@/lib/utils";
import type { VendorDetailDTO } from "@/types";

// Allow blocking render — vendor detail needs full data before paint
export const instant = false;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await apiGet<VendorDetailDTO>(`/api/vendors/${slug}`);
  const vendor = res.data;

  if (!vendor) return { title: "Vendor Not Found" };

  return {
    title: `${vendor.businessName} — ${vendor.city.name}`,
    description: vendor.description ?? `Book ${vendor.businessName} on ${APP_NAME}`,
  };
}

export default async function VendorPage({ params }: Props) {
  const { slug } = await params;
  const res = await apiGet<VendorDetailDTO>(`/api/vendors/${slug}`);
  const vendor = res.data;

  if (!vendor) notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cover */}
      <div className="relative h-48 md:h-64 rounded-lg overflow-hidden bg-muted">
        {vendor.coverImage ? (
          <img src={vendor.coverImage} alt={vendor.businessName} className="size-full object-cover" />
        ) : (
          <div className="size-full bg-gradient-to-br from-primary/10 to-primary/5" />
        )}
      </div>

      {/* Profile header */}
      <div className="relative -mt-12 px-4 flex flex-col md:flex-row md:items-end gap-4">
        <div className="size-24 rounded-full bg-background ring-4 ring-background overflow-hidden shrink-0">
          {vendor.profileImage ? (
            <img src={vendor.profileImage} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {vendor.businessName[0]}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold truncate">{vendor.businessName}</h1>
            {vendor.isVerified && <BadgeCheck className="size-5 text-blue-500 shrink-0" />}
          </div>
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            <MapPin className="size-3.5" />
            {vendor.city.name}, {vendor.city.state}
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="flex items-center gap-1">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <strong>{vendor.rating.toFixed(1)}</strong>
              <span className="text-muted-foreground">({vendor.totalReviews} reviews)</span>
            </span>
            <span className="text-muted-foreground">{vendor.totalBookings} bookings</span>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {vendor.phone && (
            <a href={`tel:${vendor.phone}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              <Phone className="size-4 mr-1" /> Call
            </a>
          )}
          {vendor.whatsapp && (
            <a
              href={`https://wa.me/91${vendor.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              WhatsApp
            </a>
          )}
        </div>
      </div>

      {vendor.description && (
        <div className="mt-6 max-w-2xl">
          <p className="text-sm text-muted-foreground">{vendor.description}</p>
        </div>
      )}

      <Separator className="my-8" />

      {/* Services */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Services ({vendor.services.length})</h2>
        {vendor.services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendor.services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No services listed yet.</p>
        )}
      </section>

      <Separator className="my-8" />

      {/* Reviews */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Reviews ({vendor.totalReviews})</h2>
        {vendor.reviews.length > 0 ? (
          <div className="space-y-4 max-w-2xl">
            {vendor.reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">{review.customer.name}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-3.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(review.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
                {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        )}
      </section>
    </div>
  );
}
