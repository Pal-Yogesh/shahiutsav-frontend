"use client";

import { useRef } from "react";
import Image from "next/image";
import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

// A statement is a list of tokens: plain text, an emphasised word, or an inline photo
export type Token =
  | { type: "text"; value: string; muted?: boolean }
  // An emphasised word with its photo pill and trailing punctuation, kept on one line
  | { type: "feature"; word: string; src: string; alt: string; suffix?: string };

type Word =
  | { kind: "word"; value: string; muted?: boolean }
  | { kind: "feature"; word: string; src: string; alt: string; suffix?: string };

function toWords(tokens: Token[]): Word[] {
  return tokens.flatMap<Word>((t) => {
    if (t.type === "feature") return [{ kind: "feature", ...t }];
    return t.value
      .split(" ")
      .filter(Boolean)
      .map((value) => ({ kind: "word", value, muted: t.muted }));
  });
}

function RevealWord({
  word,
  progress,
  range,
  accent = false,
}: {
  word: Extract<Word, { kind: "word" }>;
  progress: MotionValue<number>;
  range: [number, number];
  accent?: boolean;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <m.span
      style={{ opacity }}
      className={cn(
        "inline-block",
        accent && "font-medium italic text-wine",
        word.muted && "text-muted-grey"
      )}
    >
      {word.value}
    </m.span>
  );
}

function RevealImage({
  src,
  alt,
  progress,
  range,
}: {
  src: string;
  alt: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const scale = useTransform(progress, range, [0.4, 1]);
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <m.span
      style={{ scale, opacity }}
      className="group/pill relative inline-block h-[0.9em] w-[2.1em] translate-y-[0.1em] overflow-hidden rounded-full align-baseline shadow-[0_8px_24px_-10px_rgba(101,30,45,0.55)] ring-[3px] ring-champagne transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:w-[3.2em] hover:ring-gold"
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="220px"
        className="photo-grade object-cover transition-transform duration-700 group-hover/pill:scale-110"
      />
    </m.span>
  );
}

// Words brighten one after another as the paragraph scrolls through the viewport
export function ScrollStatement({ tokens, className }: { tokens: Token[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = toWords(tokens);
  const step = 1 / words.length;

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => {
        // Reduced motion: everything fully visible from the start
        const range: [number, number] = reduce ? [-1, 0] : [i * step, Math.min(1, (i + 1.5) * step)];
        const node =
          w.kind === "feature" ? (
            <span className="whitespace-nowrap">
              <RevealWord word={{ kind: "word", value: w.word }} progress={scrollYProgress} range={range} accent />{" "}
              <RevealImage src={w.src} alt={w.alt} progress={scrollYProgress} range={range} />
              {w.suffix && <RevealWord word={{ kind: "word", value: w.suffix }} progress={scrollYProgress} range={range} />}
            </span>
          ) : (
            <RevealWord word={w} progress={scrollYProgress} range={range} />
          );
        return (
          <span key={i}>
            {node}
            {i < words.length - 1 && " "}
          </span>
        );
      })}
    </p>
  );
}
