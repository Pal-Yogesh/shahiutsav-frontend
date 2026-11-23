import type { PriceType, VendorApplicationDTO } from "@/types";

export const MIN_DESCRIPTION = 60;
export const MAX_SERVICES = 10;
export const MAX_PORTFOLIO = 12;

export type ServiceForm = {
  key: string;
  categoryId: string;
  title: string;
  description: string;
  priceType: PriceType;
  price: string;
};

export type FormState = {
  businessName: string;
  contactName: string;
  cityId: string;
  phone: string;
  whatsapp: string;
  address: string;
  pincode: string;
  yearsInBusiness: string;
  services: ServiceForm[];
  description: string;
  instagram: string;
  website: string;
  profileImage: string;
  coverImage: string;
  portfolio: string[];
  gstNumber: string;
  termsAccepted: boolean;
};

export type StepId = "business" | "services" | "showcase" | "review";

export const STEPS: { id: StepId; title: string; caption: string; fields: (keyof FormState)[] }[] = [
  {
    id: "business",
    title: "Your business",
    caption: "Who you are and where you work",
    fields: ["businessName", "contactName", "cityId", "phone", "whatsapp", "address", "pincode", "yearsInBusiness"],
  },
  { id: "services", title: "Services & pricing", caption: "What customers can book", fields: ["services"] },
  {
    id: "showcase",
    title: "Showcase",
    caption: "Your story and best work",
    fields: ["description", "instagram", "website", "profileImage", "coverImage", "portfolio"],
  },
  { id: "review", title: "Review & submit", caption: "Check everything once", fields: ["gstNumber", "termsAccepted"] },
];

// Which step a backend field error belongs to, e.g. "services.0.price" → services
export function stepOfField(field: string): StepId {
  const root = field.split(".")[0] as keyof FormState;
  return STEPS.find((s) => s.fields.includes(root))?.id ?? "review";
}

let keySeq = 0;
export const newServiceKey = () => `svc-${Date.now()}-${keySeq++}`;

export function emptyService(categoryId = ""): ServiceForm {
  return { key: newServiceKey(), categoryId, title: "", description: "", priceType: "STARTING_FROM", price: "" };
}

export function fromApplication(app: VendorApplicationDTO | null, fallbackName: string): FormState {
  return {
    businessName: app?.businessName ?? "",
    contactName: app?.contactName ?? fallbackName,
    cityId: app?.cityId ?? "",
    phone: app?.phone ?? "",
    whatsapp: app?.whatsapp ?? "",
    address: app?.address ?? "",
    pincode: app?.pincode ?? "",
    yearsInBusiness: app?.yearsInBusiness?.toString() ?? "",
    services: app?.services.length
      ? app.services.map((s) => ({
          key: s.id,
          categoryId: s.categoryId,
          title: s.title,
          description: s.description ?? "",
          priceType: s.priceType,
          price: String(s.price),
        }))
      : [emptyService()],
    description: app?.description ?? "",
    instagram: app?.instagram ?? "",
    website: app?.website ?? "",
    profileImage: app?.profileImage ?? "",
    coverImage: app?.coverImage ?? "",
    portfolio: app?.portfolio ?? [],
    gstNumber: app?.gstNumber ?? "",
    termsAccepted: app?.termsAccepted ?? false,
  };
}

// Only the current step's fields are sent, so saving one step never clears another
export function payloadFor(step: StepId, f: FormState) {
  switch (step) {
    case "business":
      return {
        businessName: f.businessName,
        contactName: f.contactName,
        cityId: f.cityId || undefined,
        phone: f.phone,
        whatsapp: f.whatsapp,
        address: f.address,
        pincode: f.pincode,
        yearsInBusiness: f.yearsInBusiness === "" ? null : Number(f.yearsInBusiness),
      };
    case "services":
      return {
        // Rows the vendor left completely blank are dropped rather than rejected
        services: f.services
          .filter((s) => s.categoryId || s.title.trim() || s.price)
          .map(({ categoryId, title, description, priceType, price }) => ({ categoryId, title, description, priceType, price })),
      };
    case "showcase":
      return {
        description: f.description,
        instagram: f.instagram,
        website: f.website,
        profileImage: f.profileImage,
        coverImage: f.coverImage,
        portfolio: f.portfolio,
      };
    case "review":
      return { gstNumber: f.gstNumber, termsAccepted: f.termsAccepted };
  }
}

// Quick checks before saving a step; the server re-validates everything
export function checkStep(step: StepId, f: FormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (step === "business") {
    if (f.businessName.trim().length < 2) e.businessName = "Enter your business name";
    if (!f.contactName.trim()) e.contactName = "Who should we speak to?";
    if (!f.cityId) e.cityId = "Choose your city";
    if (!/^[6-9]\d{9}$/.test(f.phone.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "")))
      e.phone = "Enter a 10-digit mobile number";
    if (!f.address.trim()) e.address = "Add your business address";
    if (!/^[1-9]\d{5}$/.test(f.pincode.trim())) e.pincode = "Enter a 6-digit pincode";
  }
  if (step === "services") {
    const filled = f.services.filter((s) => s.categoryId || s.title.trim() || s.price);
    if (!filled.length) e["services.0.categoryId"] = "Add at least one service you offer";
    f.services.forEach((s, i) => {
      if (!(s.categoryId || s.title.trim() || s.price)) return;
      if (!s.categoryId) e[`services.${i}.categoryId`] = "Choose a category";
      if (s.title.trim().length < 3) e[`services.${i}.title`] = "Give this service a name";
      if (!s.price || Number(s.price) < 100) e[`services.${i}.price`] = "Enter a price of at least ₹100";
    });
  }
  if (step === "showcase" && f.description.trim().length < MIN_DESCRIPTION) {
    e.description = `Tell customers a little more, at least ${MIN_DESCRIPTION} characters`;
  }
  if (step === "review" && !f.termsAccepted) e.termsAccepted = "Accept the partner terms to submit";
  return e;
}

export function isStepComplete(step: StepId, f: FormState) {
  return Object.keys(checkStep(step, f)).length === 0;
}
