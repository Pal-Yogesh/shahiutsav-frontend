"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  invalid?: boolean;
};

// Six separate boxes that behave like one field: typing advances, Backspace
// goes back, arrows move, and pasting a whole code fills every box.
export function OtpInput({ value, onChange, length = 6, disabled, invalid }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  function setAt(i: number, digit: string) {
    const next = digits.slice();
    next[i] = digit;
    onChange(next.join("").slice(0, length));
  }

  function handleChange(i: number, raw: string) {
    const clean = raw.replace(/\D/g, "");
    if (!clean) return;
    // Several digits at once (autofill or fast typing): spread them forward
    if (clean.length > 1) {
      const next = (value.slice(0, i) + clean).slice(0, length);
      onChange(next);
      focus(next.length);
      return;
    }
    setAt(i, clean);
    focus(i + 1);
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) setAt(i, "");
      else if (i > 0) {
        setAt(i - 1, "");
        focus(i - 1);
      }
    }
    if (e.key === "ArrowLeft") focus(i - 1);
    if (e.key === "ArrowRight") focus(i + 1);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    focus(pasted.length);
  }

  return (
    <div role="group" aria-label="Verification code" className="flex justify-between gap-2 sm:gap-3">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          maxLength={length}
          value={d}
          disabled={disabled}
          autoFocus={i === 0}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.currentTarget.select()}
          className={cn(
            "h-14 w-full min-w-0 border bg-white text-center font-serif text-3xl text-charcoal outline-none transition-all duration-300 sm:h-16",
            "focus:border-burgundy focus:shadow-[0_0_0_3px_rgba(101,30,45,0.12)]",
            d ? "border-gold-deep/60" : "border-champagne",
            invalid && "border-destructive/70 text-destructive",
            disabled && "opacity-60"
          )}
        />
      ))}
    </div>
  );
}
