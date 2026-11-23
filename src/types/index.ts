// ─── API Response ────────────────────────────────────────────────────

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  // Per-field validation messages, keyed by path such as "services.0.price"
  fieldErrors?: Record<string, string>;
  meta?: PaginationMeta;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// ─── Search & Filter ─────────────────────────────────────────────────

export type SearchParams = {
  q?: string;
  city?: string;
  category?: string;
  page?: string;
  limit?: string;
  sort?: string;
};

// ─── DTOs (what frontend receives from API) ──────────────────────────

export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
};

export type CityDTO = {
  id: string;
  name: string;
  slug: string;
  state: string;
};

export type VendorCardDTO = {
  id: string;
  businessName: string;
  slug: string;
  description: string | null;
  profileImage: string | null;
  coverImage: string | null;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  city: CityDTO;
  categories: string[]; // category names
  startingPrice: number | null;
};

export type VendorDetailDTO = {
  id: string;
  businessName: string;
  slug: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  pincode: string | null;
  profileImage: string | null;
  coverImage: string | null;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  isVerified: boolean;
  city: CityDTO;
  services: ServiceDTO[];
  reviews: ReviewDTO[];
};

export type ServiceDTO = {
  id: string;
  title: string;
  description: string | null;
  priceType: string;
  price: number;
  priceUnit: string | null;
  images: string[];
  category: CategoryDTO;
};

export type ReviewDTO = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: {
    name: string;
    image: string | null;
  };
};

export type BookingDTO = {
  id: string;
  eventDate: string;
  eventType: string;
  guestCount: number | null;
  venue: string | null;
  status: string;
  totalAmount: number;
  createdAt: string;
  city: CityDTO;
  items: BookingItemDTO[];
};

export type BookingItemDTO = {
  id: string;
  price: number;
  status: string;
  notes: string | null;
  vendor: {
    businessName: string;
    slug: string;
    profileImage: string | null;
  };
  service: {
    title: string;
    category: string;
  };
};

// ─── Vendor onboarding ───────────────────────────────────────────────

export type VendorStatus = "DRAFT" | "SUBMITTED" | "CHANGES_REQUESTED" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type PriceType = "FIXED" | "STARTING_FROM" | "PER_HOUR" | "PER_DAY";
export type AdminAction = "approve" | "request_changes" | "reject" | "suspend" | "reinstate" | "reopen";

export type ApplicationServiceDTO = {
  id: string;
  categoryId: string;
  title: string;
  description: string | null;
  priceType: PriceType;
  price: number;
  category: { name: string; slug: string };
};

export type StatusEventDTO = {
  id: string;
  fromStatus: VendorStatus | null;
  toStatus: VendorStatus;
  note: string | null;
  createdAt: string;
  actor?: { name: string; role: string } | null;
};

type ApplicationFields = {
  id: string;
  status: VendorStatus;
  slug: string;
  businessName: string;
  contactName: string | null;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  pincode: string | null;
  gstNumber: string | null;
  yearsInBusiness: number | null;
  instagram: string | null;
  website: string | null;
  portfolio: string[];
  profileImage: string | null;
  coverImage: string | null;
  cityId: string;
  city: CityDTO;
  termsAccepted: boolean;
  reviewNote: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VendorApplicationDTO = ApplicationFields & {
  services: ApplicationServiceDTO[];
  events: StatusEventDTO[];
  canEdit: boolean;
  // Fields still needed before submitting, as field → message
  missing: Record<string, string>;
};

export type AdminVendorListItem = {
  id: string;
  businessName: string;
  contactName: string | null;
  phone: string | null;
  email: string;
  status: VendorStatus;
  city: string;
  categories: string[];
  submittedAt: string | null;
  updatedAt: string;
  createdAt: string;
};

export type AdminVendorDetail = ApplicationFields & {
  user: { id: string; name: string; email: string; emailVerified: boolean; createdAt: string };
  services: Omit<ApplicationServiceDTO, "categoryId">[];
  events: StatusEventDTO[];
  allowedActions: AdminAction[];
};
