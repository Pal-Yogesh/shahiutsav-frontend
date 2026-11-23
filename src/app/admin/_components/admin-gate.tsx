"use client";

import Link from "next/link";
import { Loader2, ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

// UX guard only. Every admin API call is also checked on the server.
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center" role="status">
        <Loader2 className="size-6 animate-spin text-gold-deep" />
        <span className="sr-only">Checking access</span>
      </div>
    );
  }

  if (session?.user.role !== "admin") {
    return (
      <div className="flex min-h-[60svh] items-center justify-center px-5">
        <div className="max-w-sm text-center">
          <ShieldAlert className="mx-auto size-10 text-burgundy" strokeWidth={1.5} />
          <h1 className="mt-5 font-serif text-3xl text-charcoal">{session ? "Admins only" : "Please sign in"}</h1>
          <p className="mt-3 text-sm text-muted-grey">
            {session ? "Your account doesn't have access to the admin area." : "Sign in with an admin account to continue."}
          </p>
          <Link
            href={session ? "/" : `/login?next=${encodeURIComponent("/admin/vendors")}`}
            className={cn(buttonVariants({ variant: "burgundy", size: "xl" }), "mt-8")}
          >
            {session ? "Back to home" : "Sign in"}
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
