"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, Mail, PartyPopper, Store, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/auth/otp-input";
import { sendVerificationOtp, signIn, updateUser } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";
type Step = "details" | "code" | "name" | "done";
type Intent = "customer" | "vendor";

const EASE = [0.22, 1, 0.36, 1] as const;
const RESEND_SECONDS = 30;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Plain-language versions of Better Auth's email-code errors
const FRIENDLY_ERRORS: Record<string, string> = {
  INVALID_OTP: "That code isn't right. Check the email and try again.",
  OTP_EXPIRED: "That code has expired. Send yourself a new one below.",
  TOO_MANY_ATTEMPTS: "Too many tries. Send yourself a new code below.",
  INVALID_EMAIL: "Please enter a valid email address.",
};

function friendly(err: { code?: string; message?: string } | null | undefined, fallback: string) {
  return (err?.code && FRIENDLY_ERRORS[err.code]) || err?.message || fallback;
}

// Same-site paths only, so ?next= can't send people to another website
function safeNext(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function FieldShell({ label, icon: Icon, children }: { label: string; icon: typeof Mail; children: React.ReactNode }) {
  return (
    <label className="group block">
      <span className="eyebrow text-[0.6rem] text-gold-deep">{label}</span>
      <span className="relative mt-2 flex items-center border border-champagne bg-white transition-all duration-300 focus-within:border-burgundy focus-within:shadow-[0_0_0_3px_rgba(101,30,45,0.10)]">
        <Icon className="ml-4 size-4 shrink-0 text-muted-grey transition-colors group-focus-within:text-burgundy" strokeWidth={1.75} />
        {children}
      </span>
    </label>
  );
}

const inputClass = "h-13 w-full bg-transparent px-3 text-[0.95rem] text-charcoal outline-none placeholder:text-muted-grey/60";

function IntentCard({
  value,
  current,
  onSelect,
  icon: Icon,
  title,
  text,
}: {
  value: Intent;
  current: Intent;
  onSelect: (v: Intent) => void;
  icon: typeof Store;
  title: string;
  text: string;
}) {
  const active = value === current;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={() => onSelect(value)}
      className={cn(
        "relative flex flex-col items-start gap-3 border p-4 text-left transition-all duration-300",
        active ? "border-burgundy bg-burgundy/[0.04] shadow-[0_10px_30px_-18px_rgba(101,30,45,0.6)]" : "border-champagne bg-white hover:border-gold-deep/50"
      )}
    >
      <span className={cn("flex size-10 items-center justify-center rounded-full transition-colors", active ? "bg-burgundy text-ivory" : "bg-sand text-burgundy")}>
        <Icon className="size-5" strokeWidth={1.5} />
      </span>
      <span>
        <span className="block font-serif text-xl text-charcoal">{title}</span>
        <span className="mt-0.5 block text-xs leading-snug text-muted-grey">{text}</span>
      </span>
      <span
        className={cn(
          "absolute right-3 top-3 flex size-5 items-center justify-center rounded-full border transition-all",
          active ? "border-burgundy bg-burgundy text-ivory" : "border-champagne"
        )}
      >
        {active && <Check className="size-3" strokeWidth={3} />}
      </span>
    </button>
  );
}

export function AuthFlow({ mode, next }: { mode: Mode; next?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [intent, setIntent] = useState<Intent>("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [welcomeName, setWelcomeName] = useState("");

  const destination = intent === "vendor" ? "/vendor/onboarding" : safeNext(next);

  // Resend countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  // Brief welcome, then on to wherever they were going
  useEffect(() => {
    if (step !== "done") return;
    const id = setTimeout(() => {
      router.push(destination);
      router.refresh();
    }, 1400);
    return () => clearTimeout(id);
  }, [step, destination, router]);

  async function sendCode() {
    setError("");
    setLoading(true);
    try {
      const { error: sendError } = await sendVerificationOtp({ email: email.trim(), type: "sign-in" });
      if (sendError) throw new Error(friendly(sendError, "We couldn't send the code."));
      setOtp("");
      setStep("code");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't send the code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleDetails(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup" && name.trim().length < 2) return setError("Please tell us your name.");
    if (!EMAIL_RE.test(email.trim())) return setError("Please enter a valid email address.");
    void sendCode();
  }

  async function verify(code: string) {
    if (code.length !== 6 || loading) return;
    setError("");
    setLoading(true);
    try {
      const { data, error: signInError } = await signIn.emailOtp({
        email: email.trim(),
        otp: code,
        // Only used when this email has no account yet
        ...(mode === "signup" ? { name: name.trim() } : {}),
      });
      if (signInError) throw new Error(friendly(signInError, "That code didn't work."));
      const userName = data?.user?.name?.trim() ?? "";
      if (!userName) {
        // A sign-in that created a brand-new account: ask what to call them
        setStep("name");
      } else {
        setWelcomeName(userName.split(" ")[0]);
        setStep("done");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn't work. Please try again.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Please tell us your name.");
    setError("");
    setLoading(true);
    try {
      const { error: updateError } = await updateUser({ name: name.trim() });
      if (updateError) throw new Error(updateError.message ?? "We couldn't save your name.");
      setWelcomeName(name.trim().split(" ")[0]);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't save your name.");
    } finally {
      setLoading(false);
    }
  }

  const isSignup = mode === "signup";

  return (
    <div className="w-full max-w-md">
      {/* Sign in / create account switch */}
      {step === "details" && (
        <nav aria-label="Account" className="mb-10 flex border-b border-champagne">
          {(
            [
              { href: "/login", label: "Sign in", active: !isSignup },
              { href: "/signup", label: "Create account", active: isSignup },
            ] as const
          ).map((tab) => (
            <Link
              key={tab.href}
              href={next ? `${tab.href}?next=${encodeURIComponent(next)}` : tab.href}
              aria-current={tab.active ? "page" : undefined}
              className={cn(
                "relative flex-1 pb-4 text-center font-serif text-xl transition-colors",
                tab.active ? "text-burgundy" : "text-charcoal/45 hover:text-charcoal"
              )}
            >
              {tab.label}
              {tab.active && <m.span layoutId="auth-tab" className="absolute inset-x-0 -bottom-px h-[2px] bg-burgundy" />}
            </Link>
          ))}
        </nav>
      )}

      <AnimatePresence mode="wait">
        <m.div
          key={step}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {/* ── Step 1: details ── */}
          {step === "details" && (
            <form onSubmit={handleDetails} noValidate>
              <h1 className="font-serif text-4xl leading-tight text-charcoal md:text-5xl">
                {isSignup ? (
                  <>Create your <em className="text-wine">account.</em></>
                ) : (
                  <>Welcome <em className="text-wine">back.</em></>
                )}
              </h1>
              <p className="mt-3 text-muted-grey">
                {isSignup
                  ? "No passwords to remember. We'll email you a code to confirm it's you."
                  : "Enter your email and we'll send you a 6-digit sign-in code."}
              </p>

              {isSignup && (
                <div role="radiogroup" aria-label="I'm here to" className="mt-8">
                  <p className="eyebrow text-[0.6rem] text-gold-deep">I&apos;m here to</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <IntentCard value="customer" current={intent} onSelect={setIntent} icon={PartyPopper} title="Plan an event" text="Find and book vendors" />
                    <IntentCard value="vendor" current={intent} onSelect={setIntent} icon={Store} title="List my business" text="Get bookings and grow" />
                  </div>
                </div>
              )}

              <div className="mt-8 space-y-5">
                {isSignup && (
                  <FieldShell label={intent === "vendor" ? "Your name" : "Full name"} icon={User}>
                    <input
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError("");
                      }}
                      placeholder="Priya Sharma"
                      className={inputClass}
                      disabled={loading}
                    />
                  </FieldShell>
                )}
                <FieldShell label="Email address" icon={Mail}>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@example.com"
                    className={inputClass}
                    disabled={loading}
                    autoFocus={!isSignup}
                  />
                </FieldShell>
              </div>

              <ErrorLine error={error} />

              <Button type="submit" variant="burgundy" size="xl" disabled={loading} className="mt-8 w-full">
                {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                {loading ? "Sending code" : "Continue with email"}
                {!loading && <ArrowRight className="size-4" />}
              </Button>

              <p className="mt-6 text-center text-xs leading-relaxed text-muted-grey">
                By continuing you agree to our{" "}
                <Link href="/terms" className="text-burgundy underline-offset-4 hover:underline">Terms</Link> and{" "}
                <Link href="/privacy" className="text-burgundy underline-offset-4 hover:underline">Privacy Policy</Link>.
              </p>
            </form>
          )}

          {/* ── Step 2: code ── */}
          {step === "code" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void verify(otp);
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setStep("details");
                  setError("");
                }}
                className="mb-8 flex items-center gap-2 text-sm text-muted-grey transition-colors hover:text-burgundy"
              >
                <ArrowLeft className="size-4" /> Change email
              </button>

              <span className="flex size-14 items-center justify-center rounded-full border border-gold/50 bg-sand text-burgundy">
                <Mail className="size-6" strokeWidth={1.5} />
              </span>
              <h1 className="mt-6 font-serif text-4xl leading-tight text-charcoal md:text-5xl">
                Check your <em className="text-wine">inbox.</em>
              </h1>
              <p className="mt-3 text-muted-grey">
                We sent a 6-digit code to <span className="font-medium text-charcoal">{email.trim()}</span>. It expires in 10 minutes.
              </p>

              <m.div
                className="mt-8"
                animate={error ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <OtpInput
                  value={otp}
                  onChange={(v) => {
                    setOtp(v);
                    setError("");
                    if (v.length === 6) void verify(v);
                  }}
                  disabled={loading}
                  invalid={Boolean(error)}
                />
              </m.div>

              <ErrorLine error={error} />

              <Button type="submit" variant="burgundy" size="xl" disabled={loading || otp.length !== 6} className="mt-8 w-full">
                {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                {loading ? "Verifying" : isSignup ? "Create account" : "Sign in"}
              </Button>

              <p className="mt-6 text-center text-sm text-muted-grey">
                Didn&apos;t get it? Check spam, or{" "}
                {cooldown > 0 ? (
                  <span className="text-charcoal/60">resend in {cooldown}s</span>
                ) : (
                  <button type="button" onClick={() => void sendCode()} disabled={loading} className="font-medium text-burgundy underline-offset-4 hover:underline">
                    send a new code
                  </button>
                )}
              </p>
            </form>
          )}

          {/* ── Step 3 (new accounts from sign-in only): name ── */}
          {step === "name" && (
            <form onSubmit={saveName}>
              <h1 className="font-serif text-4xl leading-tight text-charcoal md:text-5xl">
                You&apos;re in. <em className="text-wine">One last thing.</em>
              </h1>
              <p className="mt-3 text-muted-grey">This looks like a new account. What should we call you?</p>
              <div className="mt-8">
                <FieldShell label="Full name" icon={User}>
                  <input
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Priya Sharma"
                    className={inputClass}
                    disabled={loading}
                    autoFocus
                  />
                </FieldShell>
              </div>
              <ErrorLine error={error} />
              <Button type="submit" variant="burgundy" size="xl" disabled={loading} className="mt-8 w-full">
                {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                Save and continue
              </Button>
            </form>
          )}

          {/* ── Done ── */}
          {step === "done" && (
            <div className="py-10 text-center" role="status">
              <m.span
                className="mx-auto flex size-20 items-center justify-center rounded-full bg-burgundy text-ivory shadow-[0_0_0_10px_rgba(198,161,91,0.15)]"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.45, duration: 0.7 }}
              >
                <Check className="size-9" strokeWidth={2.5} />
              </m.span>
              <h1 className="mt-8 font-serif text-4xl text-charcoal md:text-5xl">
                Welcome{welcomeName ? "," : ""} <em className="text-wine">{welcomeName || "aboard"}.</em>
              </h1>
              <p className="mt-3 flex items-center justify-center gap-2 text-muted-grey">
                <Loader2 className="size-4 animate-spin" />
                {intent === "vendor" ? "Taking you to set up your business" : "Taking you back to your celebration"}
              </p>
            </div>
          )}
        </m.div>
      </AnimatePresence>
    </div>
  );
}

function ErrorLine({ error }: { error: string }) {
  return (
    <AnimatePresence>
      {error && (
        <m.p
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 overflow-hidden border-l-2 border-destructive pl-3 text-sm text-destructive"
        >
          {error}
        </m.p>
      )}
    </AnimatePresence>
  );
}
