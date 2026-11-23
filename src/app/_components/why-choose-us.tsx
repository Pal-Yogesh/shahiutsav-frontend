import Image from "next/image";
import {
  BadgeCheck,
  CalendarCheck,
  Headset,
  IndianRupee,
  LayoutGrid,
  LockKeyhole,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ImageReveal } from "@/components/motion/effects";
import { SectionHeading } from "@/components/shared/section-heading";
import { BENEFITS, WHY_IMAGES } from "@/data/homepage";

const ICONS: Record<(typeof BENEFITS)[number]["icon"], LucideIcon> = {
  BadgeCheck,
  IndianRupee,
  CalendarCheck,
  LayoutGrid,
  LockKeyhole,
  Headset,
};

export function WhyChooseUs() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="shell grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
        {/* Image collage */}
        <Reveal className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <ImageReveal className="aspect-[4/5] w-[82%]">
            <Image src={WHY_IMAGES.main} alt="Bride in a red and gold saree" fill sizes="(min-width: 1024px) 40vw, 80vw" className="photo-grade object-cover" />
          </ImageReveal>
          <div className="absolute -bottom-10 right-0 aspect-square w-[46%] overflow-hidden border-[8px] border-white shadow-[0_30px_60px_-20px_rgba(25,22,25,0.35)]">
            <Image src={WHY_IMAGES.detail} alt="Couple's hands with wedding rings" fill sizes="(min-width: 1024px) 22vw, 45vw" className="photo-grade object-cover" />
          </div>
          <div className="absolute left-[62%] top-10 flex items-center gap-3 border-l-2 border-gold bg-white px-4 py-3 shadow-[0_20px_40px_-20px_rgba(25,22,25,0.4)]">
            <span className="flex size-9 items-center justify-center rounded-full bg-burgundy text-ivory">
              <BadgeCheck className="size-5" />
            </span>
            <span className="text-sm font-semibold leading-tight text-charcoal">
              Verified<br />
              <span className="font-normal text-muted-grey">profiles</span>
            </span>
          </div>
        </Reveal>

        <div>
          <SectionHeading
            eyebrow="Why ShahiUtsav"
            title={<>The smarter way to plan <em className="text-wine">every celebration.</em></>}
          />
          <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2">
            {BENEFITS.map((benefit, i) => {
              const Icon = ICONS[benefit.icon];
              return (
                <Reveal key={benefit.title} delay={(i % 2) * 0.1}>
                  <div className="border-t border-champagne pt-5">
                    <Icon className="size-6 text-burgundy" strokeWidth={1.25} />
                  </div>
                  <h3 className="mt-4 font-serif text-2xl text-charcoal">{benefit.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-grey">{benefit.description}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
