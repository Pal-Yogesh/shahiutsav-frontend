"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";
import { OCCASIONS } from "@/data/homepage";

export function Occasions() {
  const [activeId, setActiveId] = useState<string>(OCCASIONS[0].id);
  const occasion = OCCASIONS.find((o) => o.id === activeId) ?? OCCASIONS[0];

  return (
    <section id="occasions" className="scroll-mt-20 bg-sand py-24 md:py-32">
      <div className="shell">
        <SectionHeading
          align="center"
          eyebrow="Plan by occasion"
          title={<>Everything comes together <em className="text-wine">beautifully.</em></>}
          description="Pick your occasion and see the services people usually book together."
        />

        <div role="tablist" aria-label="Occasions" className="mt-14 flex justify-center">
          <div className="flex max-w-full gap-8 overflow-x-auto border-b border-champagne px-2 [scrollbar-width:none] md:gap-12">
            {OCCASIONS.map((o) => (
              <button
                key={o.id}
                role="tab"
                type="button"
                aria-selected={o.id === activeId}
                onClick={() => setActiveId(o.id)}
                className={cn(
                  "relative shrink-0 pb-4 font-serif text-xl transition-colors duration-300 md:text-2xl",
                  o.id === activeId ? "text-burgundy" : "text-charcoal/45 hover:text-charcoal"
                )}
              >
                {o.label}
                {o.id === activeId && (
                  <m.span layoutId="occasion-line" className="absolute inset-x-0 -bottom-px h-[2px] bg-burgundy" transition={{ type: "spring", bounce: 0.15, duration: 0.6 }} />
                )}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <m.div
            key={occasion.id}
            role="tabpanel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-14 grid items-center gap-10 bg-ivory md:grid-cols-2 md:gap-16"
          >
            <div className="relative aspect-[4/3] overflow-hidden md:aspect-[5/4]">
              <Image src={occasion.image} alt={occasion.title} fill sizes="(min-width: 768px) 50vw, 100vw" className="photo-grade object-cover" />
              <span className="eyebrow absolute left-5 top-5 bg-ivory px-3 py-1.5 text-burgundy">
                {occasion.label}
              </span>
            </div>

            <div className="px-6 pb-8 md:px-0 md:pr-12 md:pb-0">
              <h3 className="font-serif text-4xl text-charcoal md:text-5xl">{occasion.title}</h3>
              <p className="mt-4 leading-relaxed text-muted-grey">{occasion.description}</p>

              <p className="mt-8 eyebrow text-gold-deep">Usually includes</p>
              <ul className="mt-5 grid border-t border-champagne sm:grid-cols-2 sm:gap-x-8">
                {occasion.includes.map((item, i) => (
                  <m.li
                    key={item}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.5 }}
                    className="flex items-center gap-3 border-b border-champagne py-3 text-sm text-charcoal"
                  >
                    <Check className="size-4 shrink-0 text-gold-deep" strokeWidth={1.75} />
                    {item}
                  </m.li>
                ))}
              </ul>

              <Link href={occasion.href} className={cn(buttonVariants({ variant: "burgundy", size: "xl" }), "mt-10")}>
                Plan a {occasion.label.toLowerCase()} <ArrowRight className="size-4" />
              </Link>
            </div>
          </m.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
