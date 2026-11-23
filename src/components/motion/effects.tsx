"use client";

import { useEffect, useRef, useState } from "react";
import { animate, m, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

type Segment = { text: string; className?: string };

// Headline that rises in word by word from behind a mask.
// Segments let one phrase carry its own styling (e.g. the italic gold word).
export function SplitHeadline({
  segments,
  className,
  delay = 0,
  as: Tag = "h1",
  trigger = "mount",
}: {
  segments: Segment[];
  className?: string;
  delay?: number;
  as?: "h1" | "h2";
  // "view" waits until the headline scrolls into view (for sections below the fold)
  trigger?: "mount" | "view";
}) {
  const words = segments.flatMap((seg) =>
    seg.text.split(" ").filter(Boolean).map((word) => ({ word, className: seg.className }))
  );

  return (
    <Tag className={className}>
      {words.map(({ word, className: wc }, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-top -mb-[0.12em]">
            <m.span
              className={cn("inline-block", wc)}
              initial={{ y: "110%" }}
              {...(trigger === "view"
                ? { whileInView: { y: "0%" }, viewport: { once: true, margin: "-15% 0px" } }
                : { animate: { y: "0%" } })}
              transition={{ duration: 1.1, delay: delay + i * 0.07, ease: EASE }}
            >
              {word}
            </m.span>
            {i < words.length - 1 && " "}
          </span>
        ))}
    </Tag>
  );
}

// Moves its child slower than the page for depth. Child should be oversized (e.g. inset -10%).
export function Parallax({
  children,
  className,
  distance = 80,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <m.div style={{ y }} className="absolute -inset-y-[12%] inset-x-0">
        {children}
      </m.div>
    </div>
  );
}

// Image container that wipes open from the bottom when scrolled into view
export function ImageReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <m.div
      className={cn("relative overflow-hidden", className)}
      initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.4, delay, ease: EASE }}
    >
      <m.div
        className="absolute inset-0"
        initial={{ scale: 1.25 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1.8, delay, ease: EASE }}
      >
        {children}
      </m.div>
    </m.div>
  );
}

// Number that counts up once when it enters the viewport
export function CountUp({ value, pad = 2, className }: { value: number; pad?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: EASE,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className={className}>
      {String(display).padStart(pad, "0")}
    </span>
  );
}
