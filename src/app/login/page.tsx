import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/auth-page";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to plan, compare and book vendors for your celebration.",
};

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return <AuthPage mode="login" searchParams={searchParams} />;
}
