import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AtSign, BadgeCheck, Globe, MapPin, Star } from "lucide-react";
import { apiGet } from "@/lib/api";
import { APP_NAME } from "@/config/constants";
import { formatDate } from "@/config/vendor";
import { FALLBACK_CITIES, orFallback } from "@/data/fallback";
import type { CityDTO, VendorDetailDTO } from "@/types";
import { VendorBooking } from "./_components/vendor-booking";

// Allow blocking render: vendor detail needs full data before paint
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
    title: `${vendor.businessName}, ${vendor.city.name}`,
    description: vendor.description ?? `Book ${vendor.businessName} on ${APP_NAME}`,
  };
}

function Stars({ rating, size = "size-4" }: { rating: number; size?: string }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${size} ${i < Math.round(rating) ? "fill-gold text-gold" : "text-champagne"}`} />
      ))}
    </span>
  );
}

export default async function VendorPage({ params }: Props) {
  const { slug } = await params;
  const [res, citiesRes] = await Promise.all([apiGet<VendorDetailDTO>(`/api/vendors/${slug}`), apiGet<CityDTO[]>("/api/cities", 3600)]);
  const vendor = res.data;
  if (!vendor) notFound();

  const cover = vendor.coverImage ?? vendor.portfolio[0] ?? null;
  const categories = [...new Set(vendor.services.map((s) => s.category.name))];

  const about = (
    <section>
      <h2 className="font-serif text-3xl text-charcoal">About</h2>
      <p className="mt-4 whitespace-pre-line leading-relaxed text-charcoal/80">{vendor.description}</p>
      {(vendor.instagram || vendor.website) && (
        <div className="mt-5 flex flex-wrap gap-5 text-sm">
          {vendor.instagram && (
            <a href={`https://instagram.com/${vendor.instagram}`} target="_blank" rel="noopener noreferrer" className="link-draw inline-flex items-center gap-1.5 text-burgundy">
              <AtSign className="size-4" /> {vendor.instagram}
            </a>
          )}
          {vendor.website && (
            <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="link-draw inline-flex items-center gap-1.5 text-burgundy">
              <Globe className="size-4" /> {new URL(vendor.website).hostname.replace(/^www\./, "")}
            </a>
          )}
        </div>
      )}
    </section>
  );

  const after = (
    <>
      {vendor.portfolio.length > 0 && (
        <section>
          <h2 className="font-serif text-3xl text-charcoal">Portfolio</h2>
          <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {vendor.portfolio.map((url, i) => (
              <li key={url} className={i === 0 ? "col-span-2 row-span-2" : ""}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="group block aspect-square overflow-hidden bg-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element -- vendor-supplied links on any host */}
                  <img src={url} alt="" loading="lazy" className="photo-grade size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl text-charcoal">Reviews</h2>
          {vendor.totalReviews > 0 && (
            <p className="flex items-center gap-2 text-sm text-muted-grey">
              <Stars rating={vendor.rating} /> {vendor.rating.toFixed(1)} · {vendor.totalReviews} review{vendor.totalReviews > 1 ? "s" : ""}
            </p>
          )}
        </div>
        {vendor.reviews.length > 0 ? (
          <ul className="mt-5 space-y-4">
            {vendor.reviews.map((r) => (
              <li key={r.id} className="border border-champagne bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-charcoal">{r.customer.name}</p>
                  <span className="text-xs text-muted-grey">{formatDate(r.createdAt)}</span>
                </div>
                <div className="mt-1.5">
                  <Stars rating={r.rating} size="size-3.5" />
                </div>
                {r.comment && <p className="mt-3 text-sm leading-relaxed text-charcoal/80">{r.comment}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-grey">No reviews yet. Reviews come only from customers who booked through {APP_NAME}.</p>
        )}
      </section>
    </>
  );

  return (
    <div className="bg-ivory">
      {/* Cover */}
      <div className="relative h-56 overflow-hidden bg-black-cherry md:h-80">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element -- vendor-supplied link
          <img src={cover} alt="" className="photo-grade size-full object-cover opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black-cherry via-black-cherry/30 to-transparent" />
      </div>

      <div className="shell relative -mt-24 md:-mt-28">
        <header className="flex flex-col gap-5 text-ivory md:flex-row md:items-end">
          <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gold/60 bg-burgundy font-serif text-4xl text-champagne md:size-28">
            {vendor.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- vendor-supplied link
              <img src={vendor.profileImage} alt="" className="size-full object-cover" />
            ) : (
              vendor.businessName[0]
            )}
          </div>
          <div className="min-w-0 pb-1">
            <p className="eyebrow text-[0.6rem] text-gold">{categories.join(" · ")}</p>
            <h1 className="mt-2 flex items-center gap-2 font-serif text-4xl leading-tight md:text-5xl">
              {vendor.businessName}
              {vendor.isVerified && <BadgeCheck className="size-7 shrink-0 text-gold" aria-label="Verified partner" />}
            </h1>
          </div>
        </header>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-champagne pb-6 text-sm text-charcoal/75">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 text-gold-deep" /> {vendor.city.name}, {vendor.city.state}
          </span>
          {vendor.totalReviews > 0 && (
            <span className="flex items-center gap-1.5">
              <Star className="size-4 fill-gold text-gold" /> {vendor.rating.toFixed(1)} ({vendor.totalReviews})
            </span>
          )}
          {vendor.totalBookings > 0 && <span>{vendor.totalBookings} events completed</span>}
          {vendor.yearsInBusiness != null && vendor.yearsInBusiness > 0 && <span>{vendor.yearsInBusiness} years in business</span>}
          {vendor.isVerified && <span className="text-gold-deep">Verified by {APP_NAME}</span>}
        </div>

        <VendorBooking
          vendor={{ id: vendor.id, slug: vendor.slug, businessName: vendor.businessName, cityId: vendor.city.id, cityName: vendor.city.name }}
          services={vendor.services}
          cities={orFallback(citiesRes.data, FALLBACK_CITIES)}
          before={about}
          after={after}
        />
      </div>
    </div>
  );
}
