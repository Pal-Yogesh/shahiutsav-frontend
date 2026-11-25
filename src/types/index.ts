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
  // Contact details are shared only after the vendor accepts a booking
  yearsInBusiness: number | null;
  instagram: string | null;
  website: string | null;
  portfolio: string[];
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
  services: (Omit<ApplicationServiceDTO, "categoryId"> & { status: "PENDING" | "LIVE" | "REJECTED"; isActive: boolean })[];
  activities: { id: string; type: string; summary: string; createdAt: string; actor: { name: string; role: string } | null }[];
  changeRequests: { id: string; changes: Record<string, string | null>; createdAt: string }[];
  events: StatusEventDTO[];
  allowedActions: AdminAction[];
};

// ─── Vendor dashboard ────────────────────────────────────────────────

export type ServiceStatus = "PENDING" | "LIVE" | "REJECTED";

export type PortalServiceDTO = {
  id: string;
  categoryId: string;
  title: string;
  description: string | null;
  priceType: PriceType;
  price: number;
  status: ServiceStatus;
  isActive: boolean;
  reviewNote: string | null;
  submittedAt: string;
  updatedAt: string;
  category: { name: string; slug: string };
};

export type ActivityDTO = {
  id: string;
  type: string;
  summary: string;
  createdAt: string;
  actor: { name: string; role: string } | null;
};

export type ChangeRequestDTO = {
  id: string;
  changes: { businessName?: string; cityId?: string; gstNumber?: string | null; reason?: string };
  previous: { businessName?: string; cityId?: string; gstNumber?: string | null };
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  note: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

export type UpcomingBookingDTO = {
  id: string;
  status: string;
  price: number;
  service: { title: string };
  booking: { eventDate: string; eventType: string; guestCount: number | null; city: { name: string }; customer: { name: string } };
};

export type ListingVisibility = "live" | "paused" | "no_services" | "suspended";

export type VendorDashboardDTO = {
  profile: Omit<VendorApplicationDTO, "services" | "events" | "canEdit" | "missing" | "termsAccepted"> & { isActive: boolean; isVerified: boolean; rating: number; totalReviews: number; totalBookings: number };
  services: PortalServiceDTO[];
  pendingChange: ChangeRequestDTO | null;
  lastDecidedChange: ChangeRequestDTO | null;
  upcoming: UpcomingBookingDTO[];
  activity: ActivityDTO[];
  notes: { id: string; toStatus: VendorStatus; note: string; createdAt: string }[];
  completeness: { percent: number; items: { key: string; label: string; done: boolean }[] };
  stats: {
    liveServices: number;
    pausedServices: number;
    pendingServices: number;
    bookingRequests: number;
    confirmedBookings: number;
    totalBookings: number;
    rating: number;
    totalReviews: number;
  };
  visibility: ListingVisibility;
};

export type AdminPendingUpdates = {
  services: {
    id: string;
    title: string;
    description: string | null;
    priceType: PriceType;
    price: number;
    submittedAt: string;
    category: { name: string };
    vendor: { id: string; businessName: string; city: string; liveCategories: string[] };
  }[];
  changes: {
    id: string;
    changes: Record<string, string | null>;
    previous: Record<string, string | null>;
    createdAt: string;
    vendor: { id: string; businessName: string; city: { name: string } };
  }[];
};

// ─── Bookings ────────────────────────────────────────────────────────

export type BookingItemStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "COMPLETED";
export type BookingStatusValue = "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

type ItemBase = {
  id: string;
  status: BookingItemStatus;
  price: number;
  listedPrice: number | null;
  notes: string | null;
  vendorNote: string | null;
  declineReason: string | null;
  cancelReason: string | null;
  cancelledBy: "customer" | "vendor" | null;
  respondedAt: string | null;
  createdAt: string;
  service: { id: string; title: string; priceType: PriceType; category: { name: string; slug?: string } };
  expired: boolean;
};

export type CustomerBookingItem = ItemBase & {
  vendor: {
    id: string;
    businessName: string;
    slug: string;
    profileImage: string | null;
    city: { name: string };
    contact: { phone: string | null; whatsapp: string | null } | null;
  };
  canCancel: boolean;
  canReview: boolean;
  review?: { rating: number; comment: string | null; createdAt: string } | null;
};

export type CustomerBooking = {
  id: string;
  eventDate: string;
  eventType: string;
  guestCount: number | null;
  venue: string | null;
  status: BookingStatusValue;
  totalAmount: number;
  createdAt: string;
  city: CityDTO;
  items: CustomerBookingItem[];
};

export type CustomerBookingDetail = CustomerBooking & {
  notes: string | null;
  contactPhone: string | null;
  events: { id: string; type: string; message: string; createdAt: string }[];
  canAddServices: boolean;
};

export type CustomerBookingList = {
  bookings: CustomerBooking[];
  counts: { upcoming: number; past: number; cancelled: number };
};

export type OpenEvent = { id: string; eventDate: string; eventType: string; city: { name: string }; _count: { items: number } };

export type VendorBookingView = "requests" | "upcoming" | "completion" | "history";

export type VendorBookingItem = ItemBase & {
  completedAt: string | null;
  booking: {
    id: string;
    eventDate: string;
    eventType: string;
    guestCount: number | null;
    venue: string | null;
    notes: string | null;
    city: { name: string };
    customer: { name: string; email?: string; phone?: string | null };
    otherServices: number;
  };
  canAccept: boolean;
  canDecline: boolean;
  canComplete: boolean;
  canCancel: boolean;
};

export type VendorBookingList = { items: VendorBookingItem[]; counts: Record<VendorBookingView, number> };
