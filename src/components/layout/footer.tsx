import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { apiGet } from "@/lib/api";
import { APP_NAME } from "@/config/constants";
import type { CategoryDTO } from "@/types";
import { FALLBACK_CATEGORIES, orFallback } from "@/data/fallback";

const LINK_GROUPS = [
  {
    title: "For vendors",
    links: [
      { href: "/vendor/onboarding", label: "Become a vendor" },
      { href: "/login", label: "Vendor login" },
      { href: "/vendor/onboarding#benefits", label: "Vendor benefits" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact" },
      { href: "/careers", label: "Careers" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/help", label: "Help centre" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms & conditions" },
      { href: "/cancellation-policy", label: "Cancellation policy" },
    ],
  },
] as const;

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com", path: "M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 4.9a4.9 4.9 0 100 9.8 4.9 4.9 0 000-9.8zm0 8.1a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zm5.1-9.4a1.2 1.2 0 100 2.3 1.2 1.2 0 000-2.3z" },
  { label: "Facebook", href: "https://facebook.com", path: "M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0022 12z" },
  { label: "YouTube", href: "https://youtube.com", path: "M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" },
] as const;

function LinkColumn({ title, links }: { title: string; links: ReadonlyArray<{ href: string; label: string }> }) {
  return (
    <div>
      <h3 className="eyebrow text-gold">{title}</h3>
      <span aria-hidden className="mt-3 block h-px w-8 bg-gold/40" />
      <ul className="mt-5 space-y-3.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="link-draw text-sm text-champagne/70 transition-colors duration-300 hover:text-gold">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Service links come from the backend so they always match live categories
async function ServiceLinks() {
  const res = await apiGet<CategoryDTO[]>("/api/categories");
  const links = orFallback(res.data, FALLBACK_CATEGORIES).slice(0, 6).map((c) => ({ href: `/search?category=${c.slug}`, label: c.name }));
  return <LinkColumn title="Explore" links={[{ href: "/search", label: "All services" }, ...links]} />;
}

export function Footer() {
  return (
    <footer className="grain relative overflow-hidden bg-[#2A0D14] text-ivory">
      {/* Continues the burgundy of the section above, deepening to black cherry */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#2A0D14_0%,#1E0A0F_55%,#150709_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_15%_20%,rgba(142,41,61,0.25),transparent_70%)]"
      />

      {/* Gold hairline with a centred diamond */}
      <div aria-hidden className="relative flex items-center justify-center">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/45" />
        <span className="mx-4 size-2 rotate-45 border border-gold/70" />
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/45" />
      </div>

      <div className="shell relative pt-20 pb-10">
        <div className="grid gap-14 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <Logo tone="light" />
            <p className="mt-6 text-sm leading-relaxed text-champagne/70">
              One platform to discover, compare and book DJs, decorators, photographers, caterers and event
              equipment across India.
            </p>
            <Link
              href="/vendor/onboarding"
              className="group mt-8 inline-flex items-center gap-3 border border-gold/40 px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold transition-colors duration-500 hover:bg-gold hover:text-charcoal"
            >
              List your business for free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            <Suspense fallback={<LinkColumn title="Explore" links={[{ href: "/search", label: "All services" }]} />}>
              <ServiceLinks />
            </Suspense>
            {LINK_GROUPS.map((group) => (
              <LinkColumn key={group.title} title={group.title} links={group.links} />
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-gold/15 pt-8 sm:flex-row">
          <p className="text-xs tracking-wide text-champagne/55">© 2026 {APP_NAME}. Made in India for every celebration.</p>
          <div className="flex gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex size-10 items-center justify-center rounded-full border border-gold/25 text-champagne/70 transition-colors duration-500 hover:border-gold hover:bg-gold hover:text-charcoal"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Oversized wordmark, shown in full */}
      <div aria-hidden className="relative py-6">
        <p className="shell select-none whitespace-nowrap text-center font-serif text-[17vw] leading-[1.1] tracking-[-0.02em] text-champagne/[0.08] lg:text-[14rem]">
          Shahi<em className="text-gold/20">Utsav</em>
        </p>
      </div>
    </footer>
  );
}
