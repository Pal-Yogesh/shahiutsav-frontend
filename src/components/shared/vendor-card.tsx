import Link from "next/link";
import { Star, BadgeCheck, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VendorCardDTO } from "@/types";

type Props = {
  vendor: VendorCardDTO;
};

export function VendorCard({ vendor }: Props) {
  return (
    <Link href={`/vendors/${vendor.slug}`} className="group block">
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        {/* Cover image */}
        <div className="relative h-40 bg-muted">
          {vendor.coverImage ? (
            <img
              src={vendor.coverImage}
              alt={vendor.businessName}
              className="size-full photo-grade object-cover"
              loading="lazy"
            />
          ) : (
            <div className="size-full bg-gradient-to-br from-primary/10 to-primary/5" />
          )}

          {vendor.isVerified && (
            <Badge variant="secondary" className="absolute top-2 right-2 gap-1">
              <BadgeCheck className="size-3" />
              Verified
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          {/* Profile image + name */}
          <div className="flex items-start gap-3">
            <div className="size-12 shrink-0 rounded-full bg-muted overflow-hidden -mt-8 ring-2 ring-background">
              {vendor.profileImage ? (
                <img
                  src={vendor.profileImage}
                  alt=""
                  className="size-full photo-grade object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="size-full bg-primary/20 flex items-center justify-center text-lg font-semibold text-primary">
                  {vendor.businessName[0]}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                {vendor.businessName}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="size-3" />
                {vendor.city.name}
              </p>
            </div>
          </div>

          {/* Description */}
          {vendor.description && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
              {vendor.description}
            </p>
          )}

          {/* Categories */}
          <div className="mt-3 flex flex-wrap gap-1">
            {vendor.categories.slice(0, 3).map((cat) => (
              <Badge key={cat} variant="outline" className="text-xs">
                {cat}
              </Badge>
            ))}
          </div>

          {/* Rating + Price */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm">
              <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{vendor.rating.toFixed(1)}</span>
              <span className="text-muted-foreground text-xs">({vendor.totalReviews})</span>
            </div>
            {vendor.startingPrice !== null && (
              <span className="text-sm font-medium">
                ₹{vendor.startingPrice.toLocaleString("en-IN")}+
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
