"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Clock, Loader2, Pause, Pencil, Play, Plus, ShieldCheck, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectField, TextArea, TextField } from "@/components/forms/fields";
import { cn } from "@/lib/utils";
import { PRICE_TYPES, SERVICE_STATUS_META, formatINR } from "@/config/vendor";
import type { PortalServiceDTO, PriceType } from "@/types";
import { useDashboard } from "./vendor-dashboard";

type Draft = { categoryId: string; title: string; priceType: PriceType; price: string; description: string };
const emptyDraft = (categoryId = ""): Draft => ({ categoryId, title: "", priceType: "STARTING_FROM", price: "", description: "" });

function priceLabel(s: { priceType: PriceType; price: number }) {
  const suffix = PRICE_TYPES.find((p) => p.value === s.priceType)?.suffix;
  return s.priceType === "STARTING_FROM" ? `from ${formatINR(s.price)}` : `${formatINR(s.price)} ${suffix}`;
}

export function ServicesTab() {
  const { data, categories, readOnly } = useDashboard();
  const [adding, setAdding] = useState<string | null>(null);

  // Categories the vendor is approved for get new services instantly
  const approved = useMemo(() => new Set(data.services.filter((s) => s.status === "LIVE").map((s) => s.categoryId)), [data.services]);

  const groups = useMemo(() => {
    const map = new Map<string, { name: string; services: PortalServiceDTO[] }>();
    for (const s of data.services) {
      if (!map.has(s.categoryId)) map.set(s.categoryId, { name: s.category.name, services: [] });
      map.get(s.categoryId)!.services.push(s);
    }
    return [...map.entries()].sort(([a], [b]) => Number(approved.has(b)) - Number(approved.has(a)));
  }, [data.services, approved]);

  const offered = new Set(data.services.map((s) => s.categoryId));
  const newCategories = categories.filter((c) => !offered.has(c.id));

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl text-charcoal">Services & prices</h2>
            <p className="mt-1 text-sm text-muted-grey">Price and description changes go live straight away.</p>
          </div>
          {!readOnly && adding === null && (
            <Button variant="burgundy" size="xl" onClick={() => setAdding("")}>
              <Plus className="size-4" /> Add a service
            </Button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {adding !== null && <AddService key="add" initialCategory={adding} approved={approved} onClose={() => setAdding(null)} />}
        </AnimatePresence>

        {groups.map(([categoryId, group]) => {
          const isApproved = approved.has(categoryId);
          const pending = group.services.some((s) => s.status === "PENDING");
          return (
            <section key={categoryId} className="border border-champagne bg-white">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-champagne/70 px-5 py-4 sm:px-6">
                <h3 className="font-serif text-xl text-charcoal">{group.name}</h3>
                <span className="flex items-center gap-1.5 text-xs text-muted-grey">
                  {isApproved ? (
                    <>
                      <ShieldCheck className="size-3.5 text-emerald-700" /> Approved category
                    </>
                  ) : pending ? (
                    <>
                      <Clock className="size-3.5 text-gold-deep" /> Our team is reviewing this category
                    </>
                  ) : (
                    "Not approved yet"
                  )}
                </span>
              </header>
              <ul className="divide-y divide-champagne/60">
                {group.services.map((s) => (
                  <ServiceRow key={s.id} service={s} />
                ))}
              </ul>
              {!readOnly && isApproved && (
                <button
                  type="button"
                  onClick={() => setAdding(categoryId)}
                  className="flex w-full items-center gap-2 border-t border-champagne/60 px-5 py-3 text-sm text-gold-deep transition-colors hover:bg-ivory hover:text-burgundy sm:px-6"
                >
                  <Plus className="size-4" /> Add another {group.name} package
                </button>
              )}
            </section>
          );
        })}
      </div>

      <aside className="space-y-6">
        {!readOnly && newCategories.length > 0 && (
          <section className="border border-gold/40 bg-gradient-to-b from-white to-sand/60 p-6">
            <Sparkles className="size-5 text-gold-deep" />
            <h3 className="mt-3 font-serif text-2xl text-charcoal">Grow into a new category</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-grey">
              Offer more and appear in more searches. Our team reviews each new category once. After that, you can add packages instantly.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {newCategories.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setAdding(c.id)}
                    className="inline-flex items-center gap-1.5 border border-champagne bg-white px-3 py-1.5 text-[0.8rem] text-charcoal transition-colors hover:border-burgundy hover:text-burgundy"
                  >
                    <Plus className="size-3.5" /> {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="border border-champagne bg-white p-6 text-sm leading-relaxed text-muted-grey">
          <h3 className="eyebrow text-[0.6rem] text-gold-deep">How changes work</h3>
          <ul className="mt-4 space-y-3">
            <li><strong className="font-medium text-charcoal">Prices & descriptions:</strong> live instantly.</li>
            <li><strong className="font-medium text-charcoal">More packages</strong> in an approved category: live instantly.</li>
            <li><strong className="font-medium text-charcoal">A new category:</strong> reviewed by our team, usually with a quick check of your work.</li>
            <li><strong className="font-medium text-charcoal">Pause</strong> a service to stop new bookings without losing it.</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}

function AddService({ initialCategory, approved, onClose }: { initialCategory: string; approved: Set<string>; onClose: () => void }) {
  const { categories, act } = useDashboard();
  const [draft, setDraft] = useState<Draft>(emptyDraft(initialCategory));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState("");
  const [busy, setBusy] = useState(false);
  const needsReview = !!draft.categoryId && !approved.has(draft.categoryId);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const local: Record<string, string> = {};
    if (!draft.categoryId) local.categoryId = "Choose a category";
    if (draft.title.trim().length < 3) local.title = "Give this service a name";
    if (!draft.price || Number(draft.price) < 100) local.price = "Enter a price of at least ₹100";
    if (Object.keys(local).length) return setErrors(local);
    setBusy(true);
    setBanner("");
    const res = await act("/services", "POST", draft, needsReview ? "Sent to our team for review" : "Service added and live");
    setBusy(false);
    if (!res.ok) {
      setErrors(res.fieldErrors);
      return setBanner(res.error);
    }
    onClose();
  }

  return (
    <m.form
      onSubmit={submit}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="border border-burgundy/30 bg-white p-6 shadow-[0_24px_50px_-40px_rgba(101,30,45,0.6)] sm:p-8">
        <div className="flex items-start justify-between">
          <h3 className="font-serif text-2xl text-charcoal">Add a service</h3>
          <button type="button" onClick={onClose} className="flex size-9 items-center justify-center text-muted-grey hover:text-burgundy" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Category"
            placeholder="Choose a category"
            value={draft.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            error={errors.categoryId}
            options={categories.map((c) => ({ value: c.id, label: `${c.name}${approved.has(c.id) ? "" : " (needs review)"}` }))}
          />
          <TextField label="Service name" placeholder="e.g. Haldi décor package" value={draft.title} onChange={(e) => set("title", e.target.value)} error={errors.title} maxLength={120} />
          <SelectField label="Pricing" value={draft.priceType} onChange={(e) => set("priceType", e.target.value as PriceType)} options={PRICE_TYPES.map((p) => ({ value: p.value, label: p.label }))} />
          <TextField label="Price" prefix="₹" inputMode="numeric" placeholder="25000" value={draft.price} onChange={(e) => set("price", e.target.value.replace(/\D/g, ""))} error={errors.price} />
          <TextArea className="sm:col-span-2" label="What's included" optional rows={3} placeholder="Equipment, hours, team size, travel…" value={draft.description} onChange={(e) => set("description", e.target.value)} error={errors.description} maxLength={600} />
        </div>

        {draft.categoryId && (
          <p className={cn("mt-5 flex items-start gap-2 px-4 py-3 text-sm", needsReview ? "bg-gold/10 text-gold-deep" : "bg-emerald-50 text-emerald-800")}>
            {needsReview ? <Clock className="mt-0.5 size-4 shrink-0" /> : <ShieldCheck className="mt-0.5 size-4 shrink-0" />}
            {needsReview
              ? "This is a new category for you, so our team will review it first. We'll email you when it's live. Adding a few photos of this kind of work to your portfolio helps."
              : "You're approved for this category, so it goes live as soon as you add it."}
          </p>
        )}
        {banner && <p role="alert" className="mt-4 text-sm text-burgundy">{banner}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline-dark" className="h-11 rounded-[2px] px-5" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="burgundy" className="h-11 rounded-[2px] px-6" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {needsReview ? "Send for review" : "Add service"}
          </Button>
        </div>
      </div>
    </m.form>
  );
}

function ServiceRow({ service: s }: { service: PortalServiceDTO }) {
  const { act, readOnly } = useDashboard();
  const [editing, setEditing] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [busy, setBusy] = useState<"toggle" | "remove" | "save" | null>(null);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState({ title: s.title, priceType: s.priceType, price: String(s.price), description: s.description ?? "" });
  const meta = SERVICE_STATUS_META[s.status];
  const paused = s.status === "LIVE" && !s.isActive;

  async function run(kind: "toggle" | "remove" | "save", fn: () => ReturnType<typeof act>) {
    setBusy(kind);
    setError("");
    const res = await fn();
    setBusy(null);
    if (!res.ok) {
      setErrors(res.fieldErrors);
      setError(res.error);
      return false;
    }
    return true;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.price || Number(draft.price) < 100) return setErrors({ price: "Enter a price of at least ₹100" });
    const ok = await run("save", () =>
      act(`/services/${s.id}`, "PATCH", draft, s.status === "REJECTED" ? "Sent back to our team for review" : "Changes are live")
    );
    if (ok) setEditing(false);
  }

  if (editing) {
    return (
      <li className="bg-ivory/60 px-5 py-5 sm:px-6">
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <TextField className="sm:col-span-2" label="Service name" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} error={errors.title} maxLength={120} />
          <SelectField label="Pricing" value={draft.priceType} onChange={(e) => setDraft({ ...draft, priceType: e.target.value as PriceType })} options={PRICE_TYPES.map((p) => ({ value: p.value, label: p.label }))} />
          <TextField label="Price" prefix="₹" inputMode="numeric" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value.replace(/\D/g, "") })} error={errors.price} />
          <TextArea className="sm:col-span-2" label="What's included" optional rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} maxLength={600} />
          {error && <p className="text-sm text-burgundy sm:col-span-2">{error}</p>}
          <div className="flex justify-end gap-3 sm:col-span-2">
            <Button type="button" variant="outline-dark" className="h-10 rounded-[2px] px-4" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="burgundy" className="h-10 rounded-[2px] px-5" disabled={!!busy}>
              {busy === "save" && <Loader2 className="size-4 animate-spin" />}
              {s.status === "REJECTED" ? "Save & resubmit" : "Save changes"}
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className={cn("px-5 py-4 sm:px-6", paused && "bg-sand/40")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn("font-medium text-charcoal", paused && "text-charcoal/60")}>{s.title}</p>
            <span className={cn("inline-flex items-center gap-1.5 border px-2 py-0.5 text-[0.7rem]", paused ? "border-charcoal/20 text-charcoal/70" : meta.tone)}>
              <span className={cn("size-1.5 rounded-full", paused ? "bg-charcoal/50" : meta.dot)} /> {paused ? "Paused" : meta.label}
            </span>
          </div>
          <p className="mt-1 text-sm tabular-nums text-gold-deep">{priceLabel(s)}</p>
          {s.description && <p className="mt-1.5 line-clamp-2 text-sm text-muted-grey">{s.description}</p>}
          {s.reviewNote && s.status !== "LIVE" && (
            <p className="mt-2 border-l-2 border-burgundy/40 pl-3 text-xs leading-relaxed text-burgundy">Our team: {s.reviewNote}</p>
          )}
          {error && <p className="mt-2 text-sm text-burgundy">{error}</p>}
        </div>

        {!readOnly && (
          <div className="flex shrink-0 items-center gap-1">
            {confirmRemove ? (
              <>
                <span className="mr-2 text-xs text-muted-grey">Remove this service?</span>
                <button type="button" onClick={() => run("remove", () => act(`/services/${s.id}`, "DELETE", undefined, "Service removed"))} disabled={!!busy} className="h-9 bg-burgundy px-3 text-xs font-medium text-ivory">
                  {busy === "remove" ? <Loader2 className="size-3.5 animate-spin" /> : "Remove"}
                </button>
                <button type="button" onClick={() => setConfirmRemove(false)} className="h-9 px-3 text-xs text-charcoal/70">
                  Keep
                </button>
              </>
            ) : (
              <>
                <IconButton
                  label="Edit"
                  onClick={() => {
                    setDraft({ title: s.title, priceType: s.priceType, price: String(s.price), description: s.description ?? "" });
                    setErrors({});
                    setError("");
                    setEditing(true);
                  }}
                  icon={Pencil}
                />
                {s.status === "LIVE" && (
                  <IconButton
                    label={s.isActive ? "Pause" : "Resume"}
                    onClick={() => run("toggle", () => act(`/services/${s.id}`, "PATCH", { isActive: !s.isActive }, s.isActive ? "Service paused" : "Service is live again"))}
                    icon={busy === "toggle" ? Loader2 : s.isActive ? Pause : Play}
                    spin={busy === "toggle"}
                  />
                )}
                <IconButton label="Remove" onClick={() => setConfirmRemove(true)} icon={Trash2} danger />
              </>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

function IconButton({ label, onClick, icon: Icon, danger, spin }: { label: string; onClick: () => void; icon: typeof Pencil; danger?: boolean; spin?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn("flex size-9 items-center justify-center text-muted-grey transition-colors", danger ? "hover:bg-burgundy/[0.06] hover:text-burgundy" : "hover:bg-sand hover:text-charcoal")}
    >
      <Icon className={cn("size-4", spin && "animate-spin")} />
    </button>
  );
}
