export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "ShahiUtsav";
export const APP_URL = process.env.NEXT_APP_URL ?? "http://localhost:3000";

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
} as const;

export const SORT_OPTIONS = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Rating", value: "rating" },
  { label: "Most Reviewed", value: "reviews" },
] as const;

export const EVENT_TYPES = [
  "Wedding",
  "Birthday",
  "Anniversary",
  "Engagement",
  "Corporate Event",
  "College Event",
  "Religious Function",
  "Concert",
  "Private Party",
  "Other",
] as const;
