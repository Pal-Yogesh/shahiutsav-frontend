"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "w-full border bg-white px-4 text-[0.95rem] text-charcoal outline-none transition-all duration-300 placeholder:text-muted-grey/55 focus:border-burgundy focus:shadow-[0_0_0_3px_rgba(101,30,45,0.10)] disabled:cursor-not-allowed disabled:bg-sand/50";

type BaseProps = {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
};

function FieldFrame({ id, label, hint, error, optional, className, children }: BaseProps & { id: string; children: React.ReactNode }) {
  return (
    <div className={cn("block", className)}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3">
        <span className="eyebrow text-[0.6rem] text-gold-deep">{label}</span>
        {optional && <span className="text-[0.7rem] text-muted-grey">Optional</span>}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-msg`} className="mt-1.5 text-[0.8rem] text-burgundy">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-msg`} className="mt-1.5 text-[0.8rem] text-muted-grey">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function a11y(id: string, error?: string, hint?: string) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error || hint ? `${id}-msg` : undefined,
  } as const;
}

export function TextField({
  label,
  hint,
  error,
  optional,
  className,
  prefix,
  ...input
}: BaseProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, "className" | "prefix"> & { prefix?: string }) {
  const id = useId();
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <div className="relative flex items-center">
        {prefix && <span className="pointer-events-none absolute left-4 text-[0.95rem] text-muted-grey">{prefix}</span>}
        <input
          {...input}
          {...a11y(id, error, hint)}
          className={cn(control, "h-12", prefix && "pl-12", error ? "border-burgundy/60" : "border-champagne")}
        />
      </div>
    </FieldFrame>
  );
}

export function TextArea({
  label,
  hint,
  error,
  optional,
  className,
  counter,
  ...input
}: BaseProps & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & { counter?: { min?: number; max: number } }) {
  const id = useId();
  const length = String(input.value ?? "").length;
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <textarea
        {...input}
        {...a11y(id, error, hint)}
        className={cn(control, "min-h-32 resize-y py-3 leading-relaxed", error ? "border-burgundy/60" : "border-champagne")}
      />
      {counter && (
        <p className={cn("mt-1 text-right text-[0.7rem] tabular-nums", counter.min && length < counter.min ? "text-muted-grey" : "text-emerald-700")}>
          {counter.min && length < counter.min ? `${counter.min - length} more characters needed` : `${length} / ${counter.max}`}
        </p>
      )}
    </FieldFrame>
  );
}

export function SelectField({
  label,
  hint,
  error,
  optional,
  className,
  placeholder,
  options,
  ...select
}: BaseProps &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className"> & {
    placeholder?: string;
    options: { value: string; label: string }[];
  }) {
  const id = useId();
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <div className="relative">
        <select
          {...select}
          {...a11y(id, error, hint)}
          className={cn(control, "h-12 cursor-pointer appearance-none pr-10", !select.value && "text-muted-grey/70", error ? "border-burgundy/60" : "border-champagne")}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value} className="text-charcoal">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-grey" />
      </div>
    </FieldFrame>
  );
}
