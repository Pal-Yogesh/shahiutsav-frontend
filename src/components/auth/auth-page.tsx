import { Suspense } from "react";
import { AuthFlow } from "@/components/auth/auth-flow";
import { AuthShowcase } from "@/components/auth/auth-showcase";

type Mode = "login" | "signup";

// Reads ?next= inside Suspense so the rest of the page can render immediately
async function Flow({ mode, searchParams }: { mode: Mode; searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <AuthFlow mode={mode} next={next} />;
}

export function AuthPage({ mode, searchParams }: { mode: Mode; searchParams: Promise<{ next?: string }> }) {
  return (
    <section className="grid min-h-[calc(100svh-4.5rem)] bg-ivory lg:grid-cols-[1.05fr_1fr]">
      {/* Phones and tablets: short decorative band */}
      <div className="h-40 lg:hidden">
        <AuthShowcase mode={mode} compact />
      </div>

      {/* Desktop: full-height decorative panel */}
      <div className="hidden lg:sticky lg:top-[4.5rem] lg:block lg:h-[calc(100svh-4.5rem)]">
        <AuthShowcase mode={mode} />
      </div>

      <div className="relative flex items-center justify-center px-5 py-12 sm:px-10 lg:py-16">
        {/* Faint arch watermark behind the form */}
        <svg viewBox="0 0 40 40" aria-hidden className="pointer-events-none absolute bottom-6 right-6 hidden size-40 text-champagne/70 xl:block">
          <path d="M6 39V18C6 10.3 12.3 4 20 4s14 6.3 14 14v21" fill="none" stroke="currentColor" strokeWidth="0.4" />
          <path d="M20 13l6 8-6 8-6-8z" fill="none" stroke="currentColor" strokeWidth="0.4" />
        </svg>
        <Suspense fallback={<div className="h-[32rem] w-full max-w-md" />}>
          <Flow mode={mode} searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}
