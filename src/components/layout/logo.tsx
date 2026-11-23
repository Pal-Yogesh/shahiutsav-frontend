import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  tone?: "light" | "dark";
  className?: string;
};

// Monogram inspired by a temple arch (toran) framing a diamond
export function Logo({ tone = "dark", className }: Props) {
  const light = tone === "light";

  return (
    <Link href="/" aria-label="ShahiUtsav home" className={cn("flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden>
        <path
          d="M6 37V18C6 10.3 12.3 4 20 4s14 6.3 14 14v19"
          fill="none"
          stroke="#C6A15B"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path d="M20 13l6 8-6 8-6-8z" fill={light ? "#FAF7F1" : "#651E2D"} />
        <circle cx="20" cy="21" r="1.6" fill="#C6A15B" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className={cn("font-serif text-xl font-semibold tracking-tight", light ? "text-ivory" : "text-burgundy")}>
          Shahi<span className="text-gold">Utsav</span>
        </span>
        <span className={cn("mt-1 text-[9px] font-semibold uppercase tracking-[0.32em]", light ? "text-champagne/60" : "text-muted-grey")}>
          Celebrations, curated
        </span>
      </span>
    </Link>
  );
}
