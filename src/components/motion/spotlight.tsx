"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

// Soft gold light that follows the cursor across the wrapped content.
// Writes CSS variables directly, so moving the mouse never re-renders React.
export function Spotlight({
  children,
  className,
  layer = "under",
  size = 520,
}: {
  children: React.ReactNode;
  className?: string;
  // "over" paints the light on top of the content (blended), for image grids
  layer?: "under" | "over";
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
    el.style.setProperty("--spot-o", "1");
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={() => ref.current?.style.setProperty("--spot-o", "0")}
      className={className}
      style={{ "--spot-x": "50%", "--spot-y": "30%", "--spot-o": "0" } as React.CSSProperties}
    >
      {layer === "over" && children}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-700 motion-reduce:hidden",
          layer === "over" && "z-10 mix-blend-soft-light"
        )}
        style={{
          opacity: "var(--spot-o)",
          background:
            layer === "over"
              ? `radial-gradient(${size}px circle at var(--spot-x) var(--spot-y), rgba(255,236,200,0.75), rgba(198,161,91,0.25) 45%, transparent 70%)`
              : `radial-gradient(${size}px circle at var(--spot-x) var(--spot-y), rgba(232,214,181,0.22), rgba(198,161,91,0.08) 40%, transparent 70%)`,
        }}
      />
      {layer === "under" && children}
    </div>
  );
}
