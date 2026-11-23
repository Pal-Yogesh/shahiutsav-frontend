"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Props = {
  links: ReadonlyArray<{ href: string; label: string }>;
  triggerClassName?: string;
};

export function MobileNav({ links, triggerClassName }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className={triggerClassName} />}>
        <Menu className="size-5" />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 bg-ivory p-6">
        <SheetTitle className="font-serif text-2xl text-burgundy">
          Shahi<span className="text-gold">Utsav</span>
        </SheetTitle>
        <nav className="mt-8 flex flex-col">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-champagne py-4 font-serif text-xl text-charcoal transition-colors hover:text-burgundy"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <Link
            href="/vendor/onboarding"
            onClick={() => setOpen(false)}
            className={cn(buttonVariants({ variant: "outline", size: "xl" }), "border-burgundy text-burgundy")}
          >
            List your business
          </Link>
          <Link href="/search" onClick={() => setOpen(false)} className={cn(buttonVariants({ variant: "gold", size: "xl" }))}>
            Book now
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
