import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
  className,
}: Props) {
  const onDark = tone === "light";

  return (
    <Reveal className={cn(align === "center" && "mx-auto text-center", "max-w-2xl", className)}>
      <p
        className={cn(
          "eyebrow flex items-center gap-4",
          onDark ? "text-gold" : "text-gold-deep",
          align === "center" && "justify-center"
        )}
      >
        <span className={cn("h-px w-10", onDark ? "bg-gold/70" : "bg-gold-deep/50")} aria-hidden />
        {eyebrow}
        {align === "center" && <span className={cn("h-px w-10", onDark ? "bg-gold/70" : "bg-gold-deep/50")} aria-hidden />}
      </p>
      <h2
        className={cn(
          "mt-5 font-serif text-[2.75rem] font-normal leading-[1.02] tracking-[-0.01em] text-balance md:text-6xl lg:text-[4.25rem]",
          onDark ? "text-ivory" : "text-charcoal"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-6 max-w-xl text-base leading-relaxed md:text-[1.0625rem]",
            align === "center" && "mx-auto",
            onDark ? "text-champagne/70" : "text-muted-grey"
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
