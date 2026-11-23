"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { ArrowLeft, AtSign, ExternalLink, Globe, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import { ACTION_META, PRICE_TYPES, STATUS_META, formatDate, formatINR } from "@/config/vendor";
import type { AdminAction, AdminVendorDetail } from "@/types";

type Load = { state: "loading" } | { state: "error"; message: string } | { state: "ready"; app: AdminVendorDetail };

export function VendorReview({ id }: { id: string }) {
  const [load, setLoad] = useState<Load>({ state: "loading" });

  useEffect(() => {
    const ctrl = new AbortController();
    clientApi<AdminVendorDetail>(`/api/admin/vendors/${id}`, { signal: ctrl.signal })
      .then((res) => setLoad(res.ok ? { state: "ready", app: res.data } : { state: "error", message: res.error }))
      .catch(() => {});
    return () => ctrl.abort();
  }, [id]);

  return (
    <div className="shell py-10 md:py-14">
      <Link href="/admin/vendors" className="link-draw inline-flex items-center gap-2 text-sm text-charcoal/70 hover:text-burgundy">
        <ArrowLeft className="size-4" /> All applications
      </Link>

      {load.state === "loading" && (
        <div className="flex justify-center py-32" role="status">
          <Loader2 className="size-6 animate-spin text-gold-deep" />
        </div>
      )}
      {load.state === "error" && <p className="py-24 text-center text-sm text-burgundy">{load.message}</p>}
      {load.state === "ready" && <Detail app={load.app} onUpdated={(app) => setLoad({ state: "ready", app })} />}
    </div>
  );
}

function Detail({ app, onUpdated }: { app: AdminVendorDetail; onUpdated: (a: AdminVendorDetail) => void }) {
  const meta = STATUS_META[app.status];

  return (
    <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-8">
        {/* Header */}
        <header className="relative overflow-hidden border border-champagne bg-white">
          {app.coverImage && (
            <div className="h-40 bg-sand">
              {/* eslint-disable-next-line @next/next/no-img-element -- vendor-supplied link */}
              <img src={app.coverImage} alt="" className="size-full object-cover" />
            </div>
          )}
          <div className="flex items-start gap-5 p-6 sm:p-8">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-burgundy font-serif text-2xl text-champagne">
              {app.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- vendor-supplied link
                <img src={app.profileImage} alt="" className="size-full object-cover" />
              ) : (
                app.businessName[0]
              )}
            </div>
            <div className="min-w-0">
              <span className={cn("inline-flex items-center gap-2 border px-2.5 py-0.5 text-xs font-medium", meta.tone)}>
                <span className={cn("size-1.5 rounded-full", meta.dot)} /> {meta.adminLabel}
              </span>
              <h1 className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl">{app.businessName}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-grey">
                <MapPin className="size-3.5" /> {app.city.name}, {app.city.state}
                {app.yearsInBusiness != null && ` · ${app.yearsInBusiness} years in business`}
              </p>
            </div>
          </div>
        </header>

        <Section title="Contact">
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <Info label="Contact person" value={app.contactName} />
            <Info label="Account" value={`${app.user.name} · joined ${formatDate(app.user.createdAt)}`} />
            <Info label="Email" value={app.user.email} icon={Mail} href={`mailto:${app.user.email}`} />
            <Info label="Mobile" value={app.phone && `+91 ${app.phone}`} icon={Phone} href={app.phone ? `tel:+91${app.phone}` : undefined} />
            <Info label="WhatsApp" value={app.whatsapp && `+91 ${app.whatsapp}`} href={app.whatsapp ? `https://wa.me/91${app.whatsapp}` : undefined} />
            <Info label="GSTIN" value={app.gstNumber} />
            <Info label="Address" value={[app.address, app.pincode].filter(Boolean).join(", ")} className="sm:col-span-2" />
          </dl>
        </Section>

        <Section title={`Services (${app.services.length})`}>
          {app.services.length ? (
            <ul className="divide-y divide-champagne/70">
              {app.services.map((s) => (
                <li key={s.id} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="min-w-0">
                    <p className="font-medium text-charcoal">{s.title}</p>
                    <p className="text-xs text-gold-deep">{s.category.name}</p>
                    {s.description && <p className="mt-1.5 text-sm leading-relaxed text-muted-grey">{s.description}</p>}
                  </div>
                  <p className="shrink-0 text-sm tabular-nums text-charcoal">
                    {formatINR(s.price)} <span className="text-xs text-muted-grey">{PRICE_TYPES.find((p) => p.value === s.priceType)?.suffix}</span>
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-grey">No services added yet.</p>
          )}
        </Section>

        <Section title="Showcase">
          <p className="whitespace-pre-line text-sm leading-relaxed text-charcoal/85">{app.description || "No description yet."}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {app.instagram && (
              <a href={`https://instagram.com/${app.instagram}`} target="_blank" rel="noreferrer noopener" className="link-draw inline-flex items-center gap-1.5 text-burgundy">
                <AtSign className="size-4" /> @{app.instagram}
              </a>
            )}
            {app.website && (
              <a href={app.website} target="_blank" rel="noreferrer noopener" className="link-draw inline-flex items-center gap-1.5 text-burgundy">
                <Globe className="size-4" /> {new URL(app.website).hostname}
              </a>
            )}
          </div>
          {app.portfolio.length > 0 && (
            <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {app.portfolio.map((url) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noreferrer noopener" className="group relative block aspect-[4/3] overflow-hidden bg-sand">
                    {/* eslint-disable-next-line @next/next/no-img-element -- vendor-supplied link */}
                    <img src={url} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <ExternalLink className="absolute right-2 top-2 size-4 text-ivory opacity-0 drop-shadow transition-opacity group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {/* Decision + history */}
      <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
        <DecisionPanel app={app} onUpdated={onUpdated} />

        <section className="border border-champagne bg-white p-6">
          <h2 className="eyebrow text-[0.6rem] text-gold-deep">History</h2>
          <ol className="mt-5 space-y-5">
            {app.events.map((e, i) => (
              <li key={e.id} className="relative pl-6">
                {i < app.events.length - 1 && <span aria-hidden className="absolute left-[5px] top-4 h-[calc(100%+0.5rem)] w-px bg-champagne" />}
                <span aria-hidden className={cn("absolute left-0 top-1.5 size-[11px] rounded-full border-2 border-white", STATUS_META[e.toStatus].dot)} />
                <p className="text-sm text-charcoal">
                  {e.fromStatus ? STATUS_META[e.toStatus].adminLabel : "Application started"}
                  {e.actor && <span className="text-muted-grey"> · {e.actor.role === "admin" ? e.actor.name : "vendor"}</span>}
                </p>
                <p className="text-xs text-muted-grey">{formatDate(e.createdAt, true)}</p>
                {e.note && <p className="mt-1.5 whitespace-pre-line border-l-2 border-gold/60 pl-3 text-xs leading-relaxed text-charcoal/80">{e.note}</p>}
              </li>
            ))}
          </ol>
        </section>
      </aside>
    </div>
  );
}

function DecisionPanel({ app, onUpdated }: { app: AdminVendorDetail; onUpdated: (a: AdminVendorDetail) => void }) {
  const [action, setAction] = useState<AdminAction | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");

  async function confirm() {
    if (!action) return;
    const rule = ACTION_META[action];
    if (rule.noteRequired && !note.trim()) return setError("Add a note. The vendor will see it.");
    setBusy(true);
    setError("");
    const res = await clientApi<AdminVendorDetail>(`/api/admin/vendors/${app.id}/decision`, { method: "POST", body: { action, note } });
    setBusy(false);
    if (!res.ok) return setError(res.fieldErrors.note ?? res.error);
    setDone(`${STATUS_META[res.data.status].adminLabel}. The vendor will be emailed.`);
    setAction(null);
    setNote("");
    onUpdated(res.data);
  }

  return (
    <section className="border border-champagne bg-white p-6">
      <h2 className="eyebrow text-[0.6rem] text-gold-deep">Decision</h2>
      {app.submittedAt && <p className="mt-2 text-xs text-muted-grey">Submitted {formatDate(app.submittedAt, true)}</p>}

      {done && <p className="mt-4 border-l-2 border-emerald-600 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{done}</p>}

      {app.allowedActions.length === 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-muted-grey">
          {app.status === "DRAFT"
            ? "The vendor hasn't submitted yet. Reach out using their contact details if they need help finishing."
            : "Waiting for the vendor to update and resubmit."}
        </p>
      ) : (
        <div className="mt-4 grid gap-2">
          {app.allowedActions.map((a) => {
            const meta = ACTION_META[a];
            const primary = a === "approve" || a === "reinstate";
            return (
              <button
                key={a}
                type="button"
                onClick={() => {
                  setAction(action === a ? null : a);
                  setError("");
                  setDone("");
                }}
                aria-pressed={action === a}
                className={cn(
                  "h-11 border px-4 text-left text-sm font-medium transition-all",
                  action === a
                    ? primary
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : meta.danger
                        ? "border-burgundy bg-burgundy text-ivory"
                        : "border-amber-700 bg-amber-600 text-white"
                    : primary
                      ? "border-emerald-700/40 text-emerald-800 hover:bg-emerald-50"
                      : meta.danger
                        ? "border-burgundy/30 text-burgundy hover:bg-burgundy/[0.04]"
                        : "border-amber-600/40 text-amber-800 hover:bg-amber-50"
                )}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence initial={false}>
        {action && (
          <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="pt-5">
              <label htmlFor="decision-note" className="flex justify-between text-xs text-muted-grey">
                <span>Note to vendor</span>
                <span>{ACTION_META[action].noteRequired ? "Required" : "Optional"}</span>
              </label>
              <textarea
                id="decision-note"
                rows={4}
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  setError("");
                }}
                placeholder={ACTION_META[action].notePlaceholder}
                maxLength={2000}
                className="mt-2 w-full resize-y border border-champagne bg-ivory/40 px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-burgundy"
              />
              {error && (
                <p role="alert" className="mt-1.5 text-xs text-burgundy">
                  {error}
                </p>
              )}
              <Button variant="burgundy" className="mt-3 h-11 w-full rounded-[2px]" disabled={busy} onClick={confirm}>
                {busy && <Loader2 className="size-4 animate-spin" />} {ACTION_META[action].verb}
              </Button>
              <p className="mt-2 text-center text-[0.7rem] text-muted-grey">The vendor gets an email with your note.</p>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {app.status === "APPROVED" && (
        <Link href={`/vendors/${app.slug}`} target="_blank" className="link-draw mt-5 inline-flex items-center gap-1.5 text-sm text-burgundy">
          View public listing <ExternalLink className="size-3.5" />
        </Link>
      )}
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-champagne bg-white p-6 sm:p-8">
      <h2 className="mb-5 font-serif text-2xl text-charcoal">{title}</h2>
      {children}
    </section>
  );
}

function Info({
  label,
  value,
  icon: Icon,
  href,
  className,
}: {
  label: string;
  value: string | null | undefined;
  icon?: typeof Mail;
  href?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-grey">{label}</dt>
      <dd className="mt-0.5 text-sm text-charcoal">
        {value ? (
          href ? (
            <a href={href} className="link-draw inline-flex items-center gap-1.5 hover:text-burgundy" target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer noopener">
              {Icon && <Icon className="size-3.5 text-muted-grey" />} {value}
            </a>
          ) : (
            value
          )
        ) : (
          <span className="text-muted-grey">Not provided</span>
        )}
      </dd>
    </div>
  );
}
