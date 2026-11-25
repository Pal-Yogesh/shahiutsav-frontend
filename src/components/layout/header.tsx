"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/search?category=sound-audio", label: "Equipment rental" },
  { href: "/search?q=wedding", label: "Weddings" },
  { href: "/search?q=corporate", label: "Corporate" },
  { href: "/#how-it-works", label: "How it works" },
] as const;

export function Header() {
  const isHome = usePathname() === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Transparent only while over the homepage hero
  const overHero = isHome && !scrolled;

  return (
    <header
      className={cn(
        "inset-x-0 top-0 z-50 transition-all duration-500",
        isHome ? "fixed" : "sticky",
        overHero
          ? "bg-transparent py-3"
          : "border-b border-champagne/70 bg-ivory/90 py-1 backdrop-blur-xl"
      )}
    >
      {/* Taller over the hero so the full logo reads well; compacts on scroll */}
      <div className={cn("shell flex items-center justify-between gap-6 transition-[height] duration-500", overHero ? "h-20" : "h-16")}>
        <Logo variant="full" tone={overHero ? "light" : "dark"} size={overHero ? "lg" : "md"} priority />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "link-draw py-1 text-[0.8125rem] font-medium tracking-wide transition-colors",
                overHero ? "text-ivory/80 hover:text-ivory" : "text-charcoal/75 hover:text-burgundy"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <Link
            href="/vendor/onboarding"
            className={cn(
              "link-draw hidden py-1 text-[0.8125rem] font-medium tracking-wide transition-colors xl:block",
              overHero ? "text-ivory/80 hover:text-ivory" : "text-charcoal/75 hover:text-burgundy"
            )}
          >
            List your business
          </Link>
          <div className="hidden md:block">
            <UserMenu tone={overHero ? "light" : "dark"} />
          </div>
          <Link href="/search" className={cn(buttonVariants({ variant: overHero ? "gold" : "burgundy" }), "hidden h-10 rounded-[2px] px-6 text-[0.68rem] font-semibold uppercase tracking-[0.2em] duration-500 sm:inline-flex")}>
            Book now
          </Link>
          <div className="lg:hidden">
            <MobileNav
              links={NAV_LINKS}
              triggerClassName={overHero ? "text-ivory hover:bg-ivory/10 hover:text-ivory" : "text-charcoal"}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
