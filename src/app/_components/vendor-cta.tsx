import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";
import { VENDOR_CTA } from "@/data/homepage";

export function VendorCta() {
  return (
    <section className="bg-ivory pb-24 md:pb-32">
      <div className="shell">
        <div className="grain group/vcta relative grid overflow-hidden bg-burgundy text-ivory lg:grid-cols-2">
          <div className="pointer-events-none absolute -left-20 -top-20 size-96 rounded-full bg-gold/20 blur-[120px]" aria-hidden />

          <div className="relative p-8 md:p-14 lg:p-16">
            <SectionHeading
              tone="light"
              eyebrow="For vendors"
              title={<>Your talent. Your business. <em className="text-gold">More opportunities.</em></>}
              description="Join a growing network of event professionals. Show your work, reach customers in your city and grow with every booking."
            />
            <div className="mt-10 space-y-4">
              {VENDOR_CTA.benefits.map((benefit, i) => (
                <Reveal key={benefit} delay={i * 0.08}>
                  <p className="flex items-center gap-3 text-champagne/90">
                    <Check className="size-4 shrink-0 text-gold" strokeWidth={1.75} />
                    {benefit}
                  </p>
                </Reveal>
              ))}
            </div>
            <Link href="/vendor/onboarding" className={cn(buttonVariants({ variant: "gold", size: "xl" }), "mt-12")}>
              Become a partner <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="relative min-h-80 bg-burgundy lg:min-h-full">
            <Image
              src={VENDOR_CTA.image}
              alt="Musician performing on stage under coloured lights"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover opacity-90 mix-blend-luminosity grayscale transition-all duration-[1.5s] group-hover/vcta:mix-blend-normal group-hover/vcta:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-burgundy via-burgundy/20 to-transparent max-lg:bg-gradient-to-b" />
            <div className="absolute bottom-6 right-6 border border-gold/40 bg-charcoal/70 px-6 py-5 backdrop-blur-md">
              <p className="eyebrow text-gold">Free to join</p>
              <p className="mt-2 font-serif text-2xl">No listing fee for early partners</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
