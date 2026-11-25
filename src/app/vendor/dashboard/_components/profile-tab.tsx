"use client";

import { useMemo, useState } from "react";
import { Clock, ImagePlus, Loader2, Lock, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectField, TextArea, TextField } from "@/components/forms/fields";
import { cn } from "@/lib/utils";
import { formatDate } from "@/config/vendor";
import { useDashboard } from "./vendor-dashboard";

const MAX_PORTFOLIO = 12;
const MIN_DESCRIPTION = 60;

type ProfileForm = {
  contactName: string;
  phone: string;
  whatsapp: string;
  address: string;
  pincode: string;
  yearsInBusiness: string;
  description: string;
  instagram: string;
  website: string;
  profileImage: string;
  coverImage: string;
  portfolio: string[];
};

export function ProfileTab() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <InstantDetails />
      <IdentityDetails />
    </div>
  );
}

function InstantDetails() {
  const { data, act, readOnly } = useDashboard();
  const p = data.profile;
  const initial = useMemo<ProfileForm>(
    () => ({
      contactName: p.contactName ?? "",
      phone: p.phone ?? "",
      whatsapp: p.whatsapp ?? "",
      address: p.address ?? "",
      pincode: p.pincode ?? "",
      yearsInBusiness: p.yearsInBusiness?.toString() ?? "",
      description: p.description ?? "",
      instagram: p.instagram ?? "",
      website: p.website ?? "",
      profileImage: p.profileImage ?? "",
      coverImage: p.coverImage ?? "",
      portfolio: p.portfolio,
    }),
    [p]
  );
  const [form, setForm] = useState<ProfileForm>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState("");
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState("");
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const set = <K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  function addPhoto() {
    const url = photo.trim();
    if (!/^https:\/\/\S+$/.test(url)) return setErrors((e) => ({ ...e, portfolio: "Paste a full image link starting with https://" }));
    if (!form.portfolio.includes(url)) set("portfolio", [...form.portfolio, url]);
    setPhoto("");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (form.description.trim().length < MIN_DESCRIPTION) return setErrors({ description: `Keep at least ${MIN_DESCRIPTION} characters so customers know what you offer` });
    if (!form.phone.trim()) return setErrors({ phone: "Customers need a number to reach you" });
    setBusy(true);
    setBanner("");
    // Only send what changed
    const changed = Object.fromEntries(
      (Object.keys(form) as (keyof ProfileForm)[])
        .filter((k) => JSON.stringify(form[k]) !== JSON.stringify(initial[k]))
        .map((k) => [k, k === "yearsInBusiness" ? (form[k] === "" ? null : Number(form[k])) : form[k]])
    );
    const res = await act("/profile", "PATCH", changed, "Profile updated");
    setBusy(false);
    if (!res.ok) {
      setErrors(Object.fromEntries(Object.entries(res.fieldErrors).map(([k, v]) => [k.split(".")[0], v])));
      setBanner(res.error);
    }
  }

  return (
    <form onSubmit={save} className="min-w-0 border border-champagne bg-white p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-charcoal">Business profile</h2>
          <p className="mt-1 text-sm text-muted-grey">Changes here go live as soon as you save.</p>
        </div>
      </div>

      <fieldset disabled={readOnly} className="mt-8 grid gap-6 sm:grid-cols-2">
        <TextField label="Contact person" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} error={errors.contactName} />
        <TextField label="Years in business" optional type="number" min={0} max={100} value={form.yearsInBusiness} onChange={(e) => set("yearsInBusiness", e.target.value)} error={errors.yearsInBusiness} />
        <TextField label="Mobile number" prefix="+91" inputMode="numeric" value={form.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone} />
        <TextField label="WhatsApp number" optional prefix="+91" inputMode="numeric" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} error={errors.whatsapp} />
        <TextField className="sm:col-span-2" label="Business address" value={form.address} onChange={(e) => set("address", e.target.value)} error={errors.address} />
        <TextField label="Pincode" inputMode="numeric" maxLength={6} value={form.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))} error={errors.pincode} />
        <TextField label="Instagram" optional prefix="@" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} error={errors.instagram} />
        <TextArea
          className="sm:col-span-2"
          label="About your business"
          rows={6}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          error={errors.description}
          maxLength={1500}
          counter={{ min: MIN_DESCRIPTION, max: 1500 }}
        />
        <TextField className="sm:col-span-2" label="Website" optional type="url" placeholder="https://" value={form.website} onChange={(e) => set("website", e.target.value)} error={errors.website} />
        <TextField label="Logo or profile photo link" optional type="url" placeholder="https://" value={form.profileImage} onChange={(e) => set("profileImage", e.target.value)} error={errors.profileImage} />
        <TextField label="Cover photo link" optional type="url" placeholder="https://" value={form.coverImage} onChange={(e) => set("coverImage", e.target.value)} error={errors.coverImage} />

        <div className="sm:col-span-2">
          <p className="eyebrow text-[0.6rem] text-gold-deep">Portfolio photos</p>
          <div className="mt-3 flex gap-2">
            <input
              type="url"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPhoto();
                }
              }}
              placeholder="https://…/photo.jpg"
              aria-label="Portfolio photo link"
              disabled={form.portfolio.length >= MAX_PORTFOLIO}
              className="h-12 min-w-0 flex-1 border border-champagne bg-white px-4 text-[0.95rem] outline-none focus:border-burgundy"
            />
            <Button type="button" variant="outline-dark" className="h-12 rounded-[2px] px-5" onClick={addPhoto} disabled={form.portfolio.length >= MAX_PORTFOLIO}>
              <ImagePlus className="size-4" /> Add
            </Button>
          </div>
          {errors.portfolio && <p className="mt-1.5 text-[0.8rem] text-burgundy">{errors.portfolio}</p>}
          {form.portfolio.length > 0 && (
            <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {form.portfolio.map((url) => (
                <li key={url} className="group relative aspect-square overflow-hidden border border-champagne bg-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element -- vendor-supplied link */}
                  <img src={url} alt="" loading="lazy" className="size-full object-cover" />
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => set("portfolio", form.portfolio.filter((x) => x !== url))}
                      className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center bg-charcoal/75 text-ivory sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Remove photo"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </fieldset>

      {banner && <p role="alert" className="mt-6 text-sm text-burgundy">{banner}</p>}

      {!readOnly && (
        <div className="sticky bottom-0 -mx-6 mt-8 flex items-center justify-between gap-4 border-t border-champagne bg-white/95 px-6 py-4 backdrop-blur sm:-mx-8 sm:px-8">
          <p className="text-xs text-muted-grey">{dirty ? "You have unsaved changes" : "Everything is saved"}</p>
          <div className="flex gap-3">
            {dirty && (
              <Button type="button" variant="outline-dark" className="h-11 rounded-[2px] px-4" onClick={() => setForm(initial)}>
                Discard
              </Button>
            )}
            <Button type="submit" variant="burgundy" className="h-11 rounded-[2px] px-6" disabled={!dirty || busy}>
              {busy && <Loader2 className="size-4 animate-spin" />} Save changes
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}

function IdentityDetails() {
  const { data, cities, act, readOnly } = useDashboard();
  const p = data.profile;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ businessName: p.businessName, cityId: p.cityId, gstNumber: p.gstNumber ?? "", reason: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState("");
  const [busy, setBusy] = useState<"send" | "cancel" | null>(null);
  const pending = data.pendingChange;
  const last = data.lastDecidedChange;
  const cityName = (id?: string) => cities.find((c) => c.id === id)?.name ?? id;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy("send");
    setBanner("");
    const body = {
      ...(form.businessName.trim() !== p.businessName ? { businessName: form.businessName.trim() } : {}),
      ...(form.cityId !== p.cityId ? { cityId: form.cityId } : {}),
      ...(form.gstNumber.trim().toUpperCase() !== (p.gstNumber ?? "") ? { gstNumber: form.gstNumber.trim().toUpperCase() } : {}),
      ...(form.reason.trim() ? { reason: form.reason.trim() } : {}),
    };
    const res = await act("/profile/change-request", "POST", body, "Sent to our team for review");
    setBusy(null);
    if (!res.ok) {
      setErrors(res.fieldErrors);
      return setBanner(res.error);
    }
    setOpen(false);
  }

  async function cancel() {
    setBusy("cancel");
    await act("/profile/change-request", "DELETE", undefined, "Request cancelled");
    setBusy(null);
  }

  return (
    <aside className="space-y-6">
      <section className="border border-champagne bg-white p-6">
        <div className="flex items-center gap-2">
          <Lock className="size-4 text-gold-deep" />
          <h3 className="eyebrow text-[0.6rem] text-gold-deep">Verified details</h3>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-grey">Customers rely on these, so changes are checked by our team before they go live.</p>
        <dl className="mt-5 space-y-3 text-sm">
          {[
            ["Business name", p.businessName],
            ["City", `${p.city.name}, ${p.city.state}`],
            ["GSTIN", p.gstNumber || "Not added"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-champagne/60 pb-3 last:border-0">
              <dt className="text-muted-grey">{k}</dt>
              <dd className="text-right text-charcoal">{v}</dd>
            </div>
          ))}
        </dl>

        {pending ? (
          <div className="mt-5 bg-gold/10 p-4 text-sm text-gold-deep">
            <p className="flex items-center gap-2 font-medium">
              <Clock className="size-4" /> Change under review
            </p>
            <ul className="mt-2 space-y-1 text-xs">
              {pending.changes.businessName && <li>Name → {pending.changes.businessName}</li>}
              {pending.changes.cityId && <li>City → {cityName(pending.changes.cityId)}</li>}
              {pending.changes.gstNumber !== undefined && <li>GSTIN → {pending.changes.gstNumber || "removed"}</li>}
            </ul>
            <p className="mt-2 text-xs opacity-80">Sent {formatDate(pending.createdAt)}</p>
            {!readOnly && (
              <button type="button" onClick={cancel} disabled={!!busy} className="link-draw mt-3 text-xs font-medium text-burgundy">
                {busy === "cancel" ? "Cancelling…" : "Cancel request"}
              </button>
            )}
          </div>
        ) : (
          !readOnly &&
          !open && (
            <Button variant="outline-dark" className="mt-5 h-11 w-full rounded-[2px]" onClick={() => setOpen(true)}>
              Request a change
            </Button>
          )
        )}

        {open && !pending && (
          <form onSubmit={submit} className="mt-5 space-y-4 border-t border-champagne pt-5">
            <TextField label="Business name" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} error={errors.businessName} maxLength={100} />
            <SelectField label="City" value={form.cityId} onChange={(e) => setForm({ ...form, cityId: e.target.value })} error={errors.cityId} options={cities.map((c) => ({ value: c.id, label: `${c.name}, ${c.state}` }))} />
            <TextField label="GSTIN" optional value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value.toUpperCase() })} error={errors.gstNumber} maxLength={15} />
            <TextArea label="Reason" optional rows={2} placeholder="e.g. We rebranded in March" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} maxLength={500} />
            {banner && <p role="alert" className="text-sm text-burgundy">{banner}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="outline-dark" className="h-10 flex-1 rounded-[2px]" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="burgundy" className="h-10 flex-1 rounded-[2px]" disabled={!!busy}>
                {busy === "send" && <Loader2 className="size-4 animate-spin" />} Send for review
              </Button>
            </div>
          </form>
        )}

        {!pending && last && (
          <p className={cn("mt-5 border-l-2 pl-3 text-xs leading-relaxed", last.status === "APPROVED" ? "border-emerald-600 text-emerald-800" : "border-burgundy text-burgundy")}>
            {last.status === "APPROVED" ? <ShieldCheck className="mr-1 inline size-3.5" /> : null}
            Your last change request was {last.status === "APPROVED" ? "approved" : "declined"} on {formatDate(last.reviewedAt)}.
            {last.note && <span className="mt-1 block text-charcoal/80">“{last.note}”</span>}
          </p>
        )}
      </section>
    </aside>
  );
}
