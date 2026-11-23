"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { AlertCircle, ArrowLeft, ArrowRight, Check, ImagePlus, Loader2, MessageSquareQuote, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectField, TextArea, TextField } from "@/components/forms/fields";
import { clientApi } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import { PARTNER_TERMS, PRICE_TYPES, formatINR } from "@/config/vendor";
import type { CategoryDTO, CityDTO, VendorApplicationDTO } from "@/types";
import {
  MAX_PORTFOLIO,
  MAX_SERVICES,
  MIN_DESCRIPTION,
  STEPS,
  checkStep,
  emptyService,
  fromApplication,
  isStepComplete,
  payloadFor,
  stepOfField,
  type FormState,
  type ServiceForm,
  type StepId,
} from "./form-model";

const EASE = [0.22, 1, 0.36, 1] as const;

type Props = {
  initial: VendorApplicationDTO | null;
  userName: string;
  categories: CategoryDTO[];
  cities: CityDTO[];
  onChange: (app: VendorApplicationDTO) => void;
};

export function ApplicationWizard({ initial, userName, categories, cities, onChange }: Props) {
  const reduce = useReducedMotion();
  const [form, setForm] = useState<FormState>(() => fromApplication(initial, userName));
  const [saved, setSaved] = useState<VendorApplicationDTO | null>(initial);
  const [step, setStep] = useState<StepId>(() => firstIncompleteStep(fromApplication(initial, userName), !!initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState("");
  const [busy, setBusy] = useState<"save" | "submit" | null>(null);
  const [dirty, setDirty] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const completed = useMemo(() => STEPS.filter((s) => isStepComplete(s.id, form)).length, [form]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
    setErrors((e) => {
      if (!(key in e)) return e;
      const rest = { ...e };
      delete rest[key];
      return rest;
    });
  }

  function updateService(index: number, patch: Partial<ServiceForm>) {
    setForm((f) => ({ ...f, services: f.services.map((s, i) => (i === index ? { ...s, ...patch } : s)) }));
    setDirty(true);
    setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !Object.keys(patch).some((p) => k === `services.${index}.${p}`))));
  }

  function scrollToTop() {
    topRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  // Saves the given step. Returns true when the server accepted it.
  async function save(target: StepId): Promise<boolean> {
    const local = checkStep(target, form);
    if (Object.keys(local).length) {
      setErrors(local);
      setBanner("Please fix the highlighted fields.");
      return false;
    }
    // Blank service rows are dropped server-side; drop them here too so error indexes line up
    let current = form;
    if (target === "services") {
      const filled = form.services.filter((s) => s.categoryId || s.title.trim() || s.price);
      current = { ...form, services: filled.length ? filled : [emptyService()] };
      setForm(current);
    }
    if (!dirty && saved) return true;

    setBusy("save");
    setBanner("");
    const res = await clientApi<VendorApplicationDTO>("/api/vendor-application", { method: "PUT", body: payloadFor(target, current) });
    setBusy(null);
    if (!res.ok) {
      setErrors(res.fieldErrors);
      setBanner(res.error);
      return false;
    }
    setSaved(res.data);
    onChange(res.data);
    setDirty(false);
    setErrors({});
    return true;
  }

  async function goTo(target: StepId) {
    if (target === step) return;
    const forward = STEPS.findIndex((s) => s.id === target) > stepIndex;
    let ok = true;
    // Moving on saves the current step; going back keeps unsaved edits in the form
    if (forward || dirty) ok = await save(step);
    if (!ok && forward) return;
    // Later steps unlock once the first save has created the application
    if (!ok && !saved && target !== "business") return;
    setErrors({});
    setBanner("");
    setStep(target);
    scrollToTop();
  }

  async function submit() {
    if (!(await save("review"))) return;
    setBusy("submit");
    const res = await clientApi<VendorApplicationDTO>("/api/vendor-application/submit", { method: "POST" });
    setBusy(null);
    if (!res.ok) {
      setErrors(res.fieldErrors);
      setBanner(res.error);
      const firstField = Object.keys(res.fieldErrors)[0];
      if (firstField && stepOfField(firstField) !== "review") {
        setStep(stepOfField(firstField));
        scrollToTop();
      }
      return;
    }
    onChange(res.data);
  }

  const changesNote = saved?.status === "CHANGES_REQUESTED" ? saved.reviewNote : null;

  return (
    <div ref={topRef} className="grid scroll-mt-28 gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14">
      {/* Step navigator */}
      <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
        <p className="eyebrow text-[0.6rem] text-gold-deep">Your application</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-[3px] flex-1 bg-champagne/60">
            <m.div className="h-full bg-burgundy" animate={{ width: `${(completed / STEPS.length) * 100}%` }} transition={{ duration: 0.6, ease: EASE }} />
          </div>
          <span className="text-xs tabular-nums text-muted-grey">
            {completed}/{STEPS.length}
          </span>
        </div>

        <ol className="mt-6 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
          {STEPS.map((s, i) => {
            const active = s.id === step;
            const done = isStepComplete(s.id, form) && !!saved;
            const locked = !saved && i > 0;
            return (
              <li key={s.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => goTo(s.id)}
                  disabled={locked || !!busy}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "group flex w-full items-center gap-3 border px-3 py-2.5 text-left transition-all duration-300 lg:border-transparent lg:px-3 lg:py-3",
                    active ? "border-burgundy/30 bg-white lg:border-champagne lg:shadow-[0_12px_30px_-22px_rgba(101,30,45,0.5)]" : "border-champagne/70 hover:bg-white/60",
                    locked && "cursor-not-allowed opacity-50"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                      active ? "border-burgundy bg-burgundy text-ivory" : done ? "border-gold bg-gold/15 text-gold-deep" : "border-champagne bg-white text-muted-grey"
                    )}
                  >
                    {done && !active ? <Check className="size-3.5" strokeWidth={2.5} /> : i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className={cn("block whitespace-nowrap text-sm font-medium", active ? "text-burgundy" : "text-charcoal")}>{s.title}</span>
                    <span className="hidden text-xs text-muted-grey lg:block">{s.caption}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <p className="mt-6 hidden text-xs leading-relaxed text-muted-grey lg:block">
          Your progress is saved each time you continue, so you can finish later on any device.
        </p>
      </aside>

      {/* Step content */}
      <div className="min-w-0">
        {changesNote && (
          <div className="mb-8 flex gap-4 border border-amber-600/25 bg-amber-50 p-5">
            <MessageSquareQuote className="mt-0.5 size-5 shrink-0 text-amber-700" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-semibold text-amber-900">Our team asked for a few changes</p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-amber-900/85">{changesNote}</p>
              <p className="mt-2 text-xs text-amber-900/70">Make the updates, then resubmit from the last step.</p>
            </div>
          </div>
        )}

        <div className="border border-champagne bg-white p-6 shadow-[0_30px_60px_-45px_rgba(25,22,25,0.45)] sm:p-10">
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={step}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <header className="mb-8 border-b border-champagne/70 pb-6">
                <p className="eyebrow text-[0.6rem] text-gold-deep">
                  Step {stepIndex + 1} of {STEPS.length}
                </p>
                <h2 className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl">{STEPS[stepIndex].title}</h2>
              </header>

              {step === "business" && <BusinessStep form={form} errors={errors} cities={cities} update={update} />}
              {step === "services" && (
                <ServicesStep
                  form={form}
                  errors={errors}
                  categories={categories}
                  updateService={updateService}
                  setServices={(services) => update("services", services)}
                />
              )}
              {step === "showcase" && <ShowcaseStep form={form} errors={errors} update={update} />}
              {step === "review" && (
                <ReviewStep form={form} errors={errors} categories={categories} cities={cities} update={update} onEdit={goTo} />
              )}
            </m.div>
          </AnimatePresence>

          {banner && (
            <p role="alert" className="mt-8 flex items-start gap-2 border-l-2 border-burgundy bg-burgundy/[0.04] px-4 py-3 text-sm text-burgundy">
              <AlertCircle className="mt-0.5 size-4 shrink-0" /> {banner}
            </p>
          )}

          <footer className="mt-10 flex flex-col-reverse gap-3 border-t border-champagne/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={() => goTo(STEPS[stepIndex - 1].id)}
                disabled={!!busy}
                className="link-draw inline-flex items-center gap-2 self-start py-2 text-sm text-charcoal/75 hover:text-burgundy"
              >
                <ArrowLeft className="size-4" /> Back
              </button>
            ) : (
              <span className="text-xs text-muted-grey">Fields marked Optional can be skipped.</span>
            )}

            {step === "review" ? (
              <Button variant="burgundy" size="xl" onClick={submit} disabled={!!busy} className="w-full sm:w-auto">
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                {saved?.status === "CHANGES_REQUESTED" ? "Resubmit for review" : "Submit for review"}
                {!busy && <ArrowRight className="size-4" />}
              </Button>
            ) : (
              <Button variant="burgundy" size="xl" onClick={() => goTo(STEPS[stepIndex + 1].id)} disabled={!!busy} className="w-full sm:w-auto">
                {busy === "save" ? <Loader2 className="size-4 animate-spin" /> : null}
                Save & continue
                {!busy && <ArrowRight className="size-4" />}
              </Button>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
}

function firstIncompleteStep(f: FormState, hasSaved: boolean): StepId {
  if (!hasSaved) return "business";
  return STEPS.find((s) => !isStepComplete(s.id, f))?.id ?? "review";
}

type Update = <K extends keyof FormState>(key: K, value: FormState[K]) => void;

// ─── Step 1 ──────────────────────────────────────────────────────────

function BusinessStep({ form, errors, cities, update }: { form: FormState; errors: Record<string, string>; cities: CityDTO[]; update: Update }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <TextField
        className="sm:col-span-2"
        label="Business name"
        placeholder="e.g. Shahi Sounds & Lights"
        value={form.businessName}
        onChange={(e) => update("businessName", e.target.value)}
        error={errors.businessName}
        maxLength={100}
        autoComplete="organization"
      />
      <TextField
        label="Contact person"
        placeholder="Full name"
        value={form.contactName}
        onChange={(e) => update("contactName", e.target.value)}
        error={errors.contactName}
        autoComplete="name"
      />
      <SelectField
        label="City"
        placeholder="Choose your city"
        value={form.cityId}
        onChange={(e) => update("cityId", e.target.value)}
        error={errors.cityId}
        options={cities.map((c) => ({ value: c.id, label: `${c.name}, ${c.state}` }))}
      />
      <TextField
        label="Mobile number"
        prefix="+91"
        inputMode="numeric"
        placeholder="98765 43210"
        value={form.phone}
        onChange={(e) => update("phone", e.target.value)}
        error={errors.phone}
        autoComplete="tel-national"
        hint="Customers' enquiries reach you here"
      />
      <TextField
        label="WhatsApp number"
        optional
        prefix="+91"
        inputMode="numeric"
        placeholder="Same as mobile? Leave blank"
        value={form.whatsapp}
        onChange={(e) => update("whatsapp", e.target.value)}
        error={errors.whatsapp}
      />
      <TextField
        className="sm:col-span-2"
        label="Business address"
        placeholder="Shop / office, street, area"
        value={form.address}
        onChange={(e) => update("address", e.target.value)}
        error={errors.address}
        autoComplete="street-address"
      />
      <TextField
        label="Pincode"
        inputMode="numeric"
        maxLength={6}
        placeholder="302001"
        value={form.pincode}
        onChange={(e) => update("pincode", e.target.value.replace(/\D/g, ""))}
        error={errors.pincode}
        autoComplete="postal-code"
      />
      <TextField
        label="Years in business"
        optional
        type="number"
        min={0}
        max={100}
        placeholder="e.g. 6"
        value={form.yearsInBusiness}
        onChange={(e) => update("yearsInBusiness", e.target.value)}
        error={errors.yearsInBusiness}
      />
    </div>
  );
}

// ─── Step 2 ──────────────────────────────────────────────────────────

function ServicesStep({
  form,
  errors,
  categories,
  updateService,
  setServices,
}: {
  form: FormState;
  errors: Record<string, string>;
  categories: CategoryDTO[];
  updateService: (i: number, patch: Partial<ServiceForm>) => void;
  setServices: (s: ServiceForm[]) => void;
}) {
  const reduce = useReducedMotion();
  const selected = new Set(form.services.map((s) => s.categoryId).filter(Boolean));

  // Tapping a category adds a service row for it, or focuses the existing one
  function toggleCategory(id: string) {
    if (selected.has(id)) return;
    const blank = form.services.findIndex((s) => !s.categoryId && !s.title && !s.price);
    if (blank >= 0) updateService(blank, { categoryId: id });
    else if (form.services.length < MAX_SERVICES) setServices([...form.services, emptyService(id)]);
  }

  return (
    <div>
      <p className="text-sm leading-relaxed text-muted-grey">
        Choose the categories you work in, then add each package or service customers can book. You&apos;ll appear in search for every category you add.
      </p>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Categories">
        {categories.map((c) => {
          const on = selected.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCategory(c.id)}
              aria-pressed={on}
              className={cn(
                "inline-flex items-center gap-2 border px-3.5 py-2 text-[0.8125rem] transition-all duration-300",
                on ? "border-burgundy bg-burgundy text-ivory" : "border-champagne bg-ivory/60 text-charcoal hover:border-gold-deep/60"
              )}
            >
              {on ? <Check className="size-3.5" strokeWidth={2.5} /> : <Plus className="size-3.5" />}
              {c.name}
            </button>
          );
        })}
      </div>

      <div className="mt-8 space-y-5">
        <AnimatePresence initial={false}>
          {form.services.map((s, i) => {
            const category = categories.find((c) => c.id === s.categoryId);
            const suffix = PRICE_TYPES.find((p) => p.value === s.priceType)?.suffix;
            return (
              <m.div
                key={s.key}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="relative border border-champagne bg-ivory/40 p-5 sm:p-6"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <p className="font-serif text-xl text-charcoal">
                    {s.title.trim() || category?.name || `Service ${i + 1}`}
                    {s.price && Number(s.price) >= 100 && (
                      <span className="ml-3 font-sans text-sm text-gold-deep">
                        {s.priceType === "STARTING_FROM" ? "from " : ""}
                        {formatINR(Number(s.price))} {s.priceType !== "STARTING_FROM" && suffix}
                      </span>
                    )}
                  </p>
                  {form.services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setServices(form.services.filter((_, j) => j !== i))}
                      className="flex size-9 items-center justify-center text-muted-grey transition-colors hover:bg-burgundy/[0.06] hover:text-burgundy"
                      aria-label={`Remove ${s.title || `service ${i + 1}`}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <SelectField
                    label="Category"
                    placeholder="Choose a category"
                    value={s.categoryId}
                    onChange={(e) => updateService(i, { categoryId: e.target.value })}
                    error={errors[`services.${i}.categoryId`]}
                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  />
                  <TextField
                    label="Service name"
                    placeholder="e.g. Wedding DJ with sound & lights"
                    value={s.title}
                    onChange={(e) => updateService(i, { title: e.target.value })}
                    error={errors[`services.${i}.title`]}
                    maxLength={120}
                  />
                  <SelectField
                    label="Pricing"
                    value={s.priceType}
                    onChange={(e) => updateService(i, { priceType: e.target.value as ServiceForm["priceType"] })}
                    options={PRICE_TYPES.map((p) => ({ value: p.value, label: p.label }))}
                  />
                  <TextField
                    label="Price"
                    prefix="₹"
                    inputMode="numeric"
                    placeholder="25000"
                    value={s.price}
                    onChange={(e) => updateService(i, { price: e.target.value.replace(/\D/g, "") })}
                    error={errors[`services.${i}.price`]}
                  />
                  <TextArea
                    className="sm:col-span-2"
                    label="What's included"
                    optional
                    rows={3}
                    placeholder="Equipment, hours, team size, travel…"
                    value={s.description}
                    onChange={(e) => updateService(i, { description: e.target.value })}
                    error={errors[`services.${i}.description`]}
                    maxLength={600}
                  />
                </div>
              </m.div>
            );
          })}
        </AnimatePresence>
      </div>

      {form.services.length < MAX_SERVICES && (
        <button
          type="button"
          onClick={() => setServices([...form.services, emptyService()])}
          className="mt-5 flex w-full items-center justify-center gap-2 border border-dashed border-gold-deep/40 py-4 text-sm text-gold-deep transition-colors hover:border-burgundy hover:bg-burgundy/[0.03] hover:text-burgundy"
        >
          <Plus className="size-4" /> Add another service
        </button>
      )}
      {errors.services && <p className="mt-3 text-sm text-burgundy">{errors.services}</p>}
    </div>
  );
}

// ─── Step 3 ──────────────────────────────────────────────────────────

function ShowcaseStep({ form, errors, update }: { form: FormState; errors: Record<string, string>; update: Update }) {
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoError, setPhotoError] = useState("");

  function addPhoto() {
    const url = photoUrl.trim();
    if (!/^https:\/\/\S+$/.test(url)) return setPhotoError("Paste a full image link starting with https://");
    if (form.portfolio.includes(url)) return setPhotoError("That photo is already added");
    update("portfolio", [...form.portfolio, url]);
    setPhotoUrl("");
    setPhotoError("");
  }

  const portfolioError = Object.entries(errors).find(([k]) => k.startsWith("portfolio"))?.[1];

  return (
    <div className="grid gap-6">
      <TextArea
        label="About your business"
        rows={6}
        placeholder="What makes your work special? Mention signature setups, events you love, team size and the cities you travel to."
        value={form.description}
        onChange={(e) => update("description", e.target.value)}
        error={errors.description}
        maxLength={1500}
        counter={{ min: MIN_DESCRIPTION, max: 1500 }}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="Instagram"
          optional
          prefix="@"
          placeholder="shahi.events"
          value={form.instagram}
          onChange={(e) => update("instagram", e.target.value)}
          error={errors.instagram}
        />
        <TextField
          label="Website"
          optional
          type="url"
          placeholder="https://"
          value={form.website}
          onChange={(e) => update("website", e.target.value)}
          error={errors.website}
        />
        <TextField
          label="Logo or profile photo link"
          optional
          type="url"
          placeholder="https://"
          value={form.profileImage}
          onChange={(e) => update("profileImage", e.target.value)}
          error={errors.profileImage}
        />
        <TextField
          label="Cover photo link"
          optional
          type="url"
          placeholder="https://"
          value={form.coverImage}
          onChange={(e) => update("coverImage", e.target.value)}
          error={errors.coverImage}
        />
      </div>

      <div>
        <p className="eyebrow text-[0.6rem] text-gold-deep">Portfolio photos</p>
        <p className="mt-1.5 text-[0.8rem] text-muted-grey">
          Paste links to your best event photos (up to {MAX_PORTFOLIO}). Vendors with photos get approved faster.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            type="url"
            value={photoUrl}
            onChange={(e) => {
              setPhotoUrl(e.target.value);
              setPhotoError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPhoto();
              }
            }}
            placeholder="https://…/photo.jpg"
            aria-label="Photo link"
            disabled={form.portfolio.length >= MAX_PORTFOLIO}
            className="h-12 min-w-0 flex-1 border border-champagne bg-white px-4 text-[0.95rem] outline-none transition-all focus:border-burgundy focus:shadow-[0_0_0_3px_rgba(101,30,45,0.10)]"
          />
          <Button type="button" variant="outline-dark" className="h-12 rounded-[2px] px-5" onClick={addPhoto} disabled={form.portfolio.length >= MAX_PORTFOLIO}>
            <ImagePlus className="size-4" /> Add
          </Button>
        </div>
        {(photoError || portfolioError) && <p className="mt-1.5 text-[0.8rem] text-burgundy">{photoError || portfolioError}</p>}

        {form.portfolio.length > 0 && (
          <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {form.portfolio.map((url) => (
              <li key={url} className="group relative aspect-square overflow-hidden border border-champagne bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element -- vendor-supplied links on any host */}
                <img src={url} alt="" className="size-full object-cover" loading="lazy" />
                <button
                  type="button"
                  onClick={() => update("portfolio", form.portfolio.filter((p) => p !== url))}
                  className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center bg-charcoal/75 text-ivory opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                  aria-label="Remove photo"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Step 4 ──────────────────────────────────────────────────────────

function ReviewStep({
  form,
  errors,
  categories,
  cities,
  update,
  onEdit,
}: {
  form: FormState;
  errors: Record<string, string>;
  categories: CategoryDTO[];
  cities: CityDTO[];
  update: Update;
  onEdit: (s: StepId) => void;
}) {
  const city = cities.find((c) => c.id === form.cityId);
  const services = form.services.filter((s) => s.categoryId && s.title);
  const outstanding = Object.entries(errors).filter(([k]) => k !== "termsAccepted" && k !== "gstNumber");

  return (
    <div className="space-y-8">
      {outstanding.length > 0 && (
        <div className="border border-burgundy/25 bg-burgundy/[0.03] p-5">
          <p className="text-sm font-semibold text-burgundy">Still needed before you can submit</p>
          <ul className="mt-2 space-y-1">
            {outstanding.map(([field, message]) => (
              <li key={field}>
                <button type="button" onClick={() => onEdit(stepOfField(field))} className="text-left text-sm text-burgundy underline-offset-4 hover:underline">
                  {message}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Summary title="Your business" onEdit={() => onEdit("business")}>
        <SummaryRow label="Business" value={form.businessName} />
        <SummaryRow label="Contact" value={form.contactName} />
        <SummaryRow label="City" value={city ? `${city.name}, ${city.state}` : ""} />
        <SummaryRow label="Mobile" value={form.phone && `+91 ${form.phone}`} />
        <SummaryRow label="Address" value={[form.address, form.pincode].filter(Boolean).join(", ")} />
      </Summary>

      <Summary title={`Services (${services.length})`} onEdit={() => onEdit("services")}>
        {services.length ? (
          <ul className="divide-y divide-champagne/60">
            {services.map((s) => (
              <li key={s.key} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                <span>
                  <span className="text-charcoal">{s.title}</span>
                  <span className="ml-2 text-xs text-muted-grey">{categories.find((c) => c.id === s.categoryId)?.name}</span>
                </span>
                <span className="shrink-0 tabular-nums text-gold-deep">{formatINR(Number(s.price))}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-burgundy">No services added yet</p>
        )}
      </Summary>

      <Summary title="Showcase" onEdit={() => onEdit("showcase")}>
        <p className="line-clamp-3 text-sm leading-relaxed text-charcoal/80">{form.description || <span className="text-burgundy">No description yet</span>}</p>
        <p className="mt-2 text-xs text-muted-grey">
          {form.portfolio.length} photo{form.portfolio.length === 1 ? "" : "s"}
          {form.instagram && ` · @${form.instagram.replace(/^@/, "")}`}
        </p>
      </Summary>

      <TextField
        label="GSTIN"
        optional
        placeholder="22AAAAA0000A1Z5"
        value={form.gstNumber}
        onChange={(e) => update("gstNumber", e.target.value.toUpperCase())}
        error={errors.gstNumber}
        maxLength={15}
        hint="Registered businesses get a GST badge after verification"
      />

      <div>
        <label className={cn("flex cursor-pointer gap-4 border p-5 transition-colors", form.termsAccepted ? "border-burgundy/40 bg-burgundy/[0.03]" : errors.termsAccepted ? "border-burgundy/60" : "border-champagne")}>
          <input
            type="checkbox"
            checked={form.termsAccepted}
            onChange={(e) => update("termsAccepted", e.target.checked)}
            className="mt-1 size-4 shrink-0 accent-burgundy"
          />
          <span>
            <span className="block text-sm font-medium text-charcoal">I agree to the partner terms</span>
            <ul className="mt-2 space-y-1 text-[0.8rem] leading-relaxed text-muted-grey">
              {PARTNER_TERMS.map((t) => (
                <li key={t}>· {t}</li>
              ))}
            </ul>
          </span>
        </label>
        {errors.termsAccepted && <p className="mt-1.5 text-[0.8rem] text-burgundy">{errors.termsAccepted}</p>}
      </div>
    </div>
  );
}

function Summary({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <section className="border-b border-champagne/70 pb-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-serif text-xl text-charcoal">{title}</h3>
        <button type="button" onClick={onEdit} className="link-draw text-xs font-medium uppercase tracking-[0.18em] text-gold-deep hover:text-burgundy">
          Edit
        </button>
      </div>
      {children}
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-3 py-1 text-sm">
      <span className="text-muted-grey">{label}</span>
      <span className={value ? "text-charcoal" : "text-burgundy"}>{value || "Missing"}</span>
    </div>
  );
}
