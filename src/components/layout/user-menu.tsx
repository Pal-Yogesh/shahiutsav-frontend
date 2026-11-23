"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, ShieldCheck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function UserMenu({ tone = "dark" }: { tone?: "light" | "dark" }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return <div className="size-9 animate-pulse rounded-full bg-champagne/40" />;
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className={cn(
          "link-draw px-1 py-1 text-[0.8125rem] font-medium tracking-wide transition-colors",
          tone === "light" ? "text-ivory/80 hover:text-ivory" : "text-charcoal/75 hover:text-burgundy"
        )}
      >
        Sign in
      </Link>
    );
  }

  const user = session.user;
  const initials = user.name?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="rounded-full" />}
      >
        <Avatar className="size-8">
          <AvatarImage src={user.image ?? undefined} alt={user.name} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard" />}>
          <LayoutDashboard className="mr-2 size-4" />
          Dashboard
        </DropdownMenuItem>
        {user.role === "admin" && (
          <DropdownMenuItem render={<Link href="/admin/vendors" />}>
            <ShieldCheck className="mr-2 size-4" />
            Admin
          </DropdownMenuItem>
        )}
        <DropdownMenuItem render={<Link href="/vendor/onboarding" />}>
          <Store className="mr-2 size-4" />
          {user.role === "customer" ? "Become a vendor" : "My business"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            router.push("/");
            router.refresh();
          }}
        >
          <LogOut className="mr-2 size-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
