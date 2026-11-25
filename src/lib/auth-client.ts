import { createAuthClient } from "better-auth/react";
import { emailOTPClient, adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // Same-origin: /api/auth/* is proxied to the backend by next.config.ts (see lib/client-api.ts)
  baseURL: typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  plugins: [emailOTPClient(), adminClient()],
});

export const {
  useSession,
  signOut,
  signIn,
  updateUser,
  emailOtp: { sendVerificationOtp },
} = authClient;
