import { Suspense } from "react";
import { Hero } from "@/app/_components/hero";
import { IntroStatement } from "@/app/_components/intro-statement";
import { ServicesBento } from "@/app/_components/services-bento";
import { Occasions } from "@/app/_components/occasions";
import { HowItWorks } from "@/app/_components/how-it-works";
import { WhyChooseUs } from "@/app/_components/why-choose-us";
import { Gallery } from "@/app/_components/gallery";
import { VendorCta } from "@/app/_components/vendor-cta";
import { Testimonials } from "@/app/_components/testimonials";
import { FaqSection } from "@/app/_components/faq-section";
import { FinalCta } from "@/app/_components/final-cta";
import { MobileCtaBar } from "@/components/layout/mobile-cta-bar";
import { SectionHeading } from "@/components/shared/section-heading";
import { VendorCard } from "@/components/shared/vendor-card";
import { apiGet } from "@/lib/api";
import type { VendorCardDTO } from "@/types";

// Renders only once verified vendors exist in the backend
async function FeaturedVendors() {
  const res = await apiGet<VendorCardDTO[]>("/api/vendors/featured");
  const vendors = res.data ?? [];
  if (vendors.length === 0) return null;

  return (
    <section className="bg-ivory py-24 md:py-32">
      <div className="shell">
        <SectionHeading
          eyebrow="Featured professionals"
          title={<>Meet the people behind <em className="text-wine">extraordinary events.</em></>}
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <IntroStatement />
      <ServicesBento />
      <Suspense fallback={null}>
        <FeaturedVendors />
      </Suspense>
      <Occasions />
      <HowItWorks />
      <WhyChooseUs />
      <Gallery />
      <VendorCta />
      <Testimonials />
      <FaqSection />
      <FinalCta />
      <MobileCtaBar />
    </>
  );
}
