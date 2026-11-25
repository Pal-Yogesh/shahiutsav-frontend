import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Brand assets are generated from the originals in /public by `npm run brand:assets`
// (background removed, trimmed and resized). Sizes below match those files.
const FULL = { width: 146, height: 216 };
const MARK = { width: 188, height: 192 };

type Props = {
  /** "full": the complete logo (header). "mark": crown-lotus emblem with the name (footer). */
  variant?: "full" | "mark";
  /** "light" for dark backgrounds */
  tone?: "light" | "dark";
  /** Full logo height: "lg" 72px (header over the hero), "md" 56px */
  size?: "lg" | "md";
  className?: string;
  priority?: boolean;
};

export function Logo({ variant = "full", tone = "dark", size = "md", className, priority }: Props) {
  const light = tone === "light";

  if (variant === "full") {
    return (
      <Link href="/" aria-label="ShahiUtsav home" className={cn("flex shrink-0 items-center", className)}>
        <Image
          src={light ? "/brand/full-logo-light.png" : "/brand/full-logo.png"}
          alt="ShahiUtsav, a legacy of royalty"
          width={FULL.width}
          height={FULL.height}
          priority={priority}
          className={cn("w-auto transition-[height] duration-500", size === "lg" ? "h-[4.5rem]" : "h-14")}
        />
      </Link>
    );
  }

  return (
    <Link href="/" aria-label="ShahiUtsav home" className={cn("flex items-center gap-3", className)}>
      <Image src="/brand/logo-mark.png" alt="" width={MARK.width} height={MARK.height} className="size-12 shrink-0 object-contain" />
      <span className="flex flex-col leading-none">
        <span className={cn("font-serif text-2xl font-semibold tracking-tight", light ? "text-ivory" : "text-burgundy")}>
          Shahi<span className="text-gold">Utsav</span>
        </span>
        <span className={cn("mt-1.5 text-[9px] font-semibold uppercase tracking-[0.32em]", light ? "text-champagne/60" : "text-muted-grey")}>
          A legacy of royalty
        </span>
      </span>
    </Link>
  );
}
