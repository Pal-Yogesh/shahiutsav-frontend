"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";
import { FAQS } from "@/data/homepage";

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-sand py-24 md:py-32">
      <div className="shell grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            eyebrow="FAQ"
            title={<>Questions, <em className="text-wine">answered.</em></>}
            description="Everything you need to know about booking services and renting equipment."
          />
          <div className="mt-10 rounded-[2px] bg-burgundy p-7 text-ivory">
            <p className="font-serif text-3xl">Still planning?</p>
            <p className="mt-2 text-sm text-champagne/80">
              Tell us about your event and we&apos;ll point you to the right vendors.
            </p>
            <Link href="/contact" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold">
              Talk to us <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="divide-y divide-champagne border-y border-champagne">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className={cn("font-serif text-xl transition-colors md:text-2xl", isOpen ? "text-burgundy" : "text-charcoal")}>
                    {faq.question}
                  </span>
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                      isOpen ? "rotate-45 border-burgundy bg-burgundy text-ivory" : "border-champagne text-burgundy"
                    )}
                  >
                    <Plus className="size-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-6 leading-relaxed text-muted-grey">{faq.answer}</p>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
