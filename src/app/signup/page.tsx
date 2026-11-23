import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/auth-page";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a free account to book DJs, décor, photographers and more, or list your business.",
};

export default function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return <AuthPage mode="signup" searchParams={searchParams} />;
}
