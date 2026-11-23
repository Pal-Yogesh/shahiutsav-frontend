import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ServiceDTO } from "@/types";

type Props = {
  service: ServiceDTO;
};

function formatPrice(price: number, priceType: string, priceUnit: string | null): string {
  const formatted = `₹${price.toLocaleString("en-IN")}`;
  if (priceType === "STARTING_FROM") return `From ${formatted}`;
  if (priceUnit) return `${formatted} ${priceUnit}`;
  return formatted;
}

export function ServiceCard({ service }: Props) {
  return (
    <Card>
      {/* Service image */}
      {service.images.length > 0 && (
        <div className="h-36 overflow-hidden rounded-t-lg">
          <img
            src={service.images[0]}
            alt={service.title}
            className="size-full photo-grade object-cover"
            loading="lazy"
          />
        </div>
      )}

      <CardContent className="p-4">
        <Badge variant="outline" className="text-xs mb-2">
          {service.category.name}
        </Badge>
        <h4 className="font-medium text-sm">{service.title}</h4>
        {service.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {service.description}
          </p>
        )}
        <p className="mt-2 text-sm font-semibold">
          {formatPrice(service.price, service.priceType, service.priceUnit)}
        </p>
      </CardContent>
    </Card>
  );
}
