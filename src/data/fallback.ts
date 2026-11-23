// Used only when the backend is unreachable, so the homepage never renders
// empty. Mirrors shahiutsav-backend/src/seed.ts; keep the two in sync.
import type { CategoryDTO, CityDTO } from "@/types";

const img = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const FALLBACK_CATEGORIES: CategoryDTO[] = [
  { id: "dj-entertainment", name: "DJ & Entertainment", slug: "dj-entertainment", icon: "Disc3", image: img("1574391884720-bbc3740c59d1"), description: "Professional DJs, live bands, singers and dhol players" },
  { id: "photography", name: "Photography & Video", slug: "photography", icon: "Camera", image: img("1452587925148-ce544e77e70d"), description: "Wedding, pre-wedding, cinematic and drone coverage" },
  { id: "decoration", name: "Decoration", slug: "decoration", icon: "Flower2", image: img("1523438885200-e635ba2c371e"), description: "Mandaps, floral design, themes and entrance gates" },
  { id: "catering", name: "Catering", slug: "catering", icon: "UtensilsCrossed", image: img("1555244162-803834f70033"), description: "Multi-cuisine caterers, live counters and food stalls" },
  { id: "sound-audio", name: "Sound & Audio", slug: "sound-audio", icon: "Speaker", image: img("1524368535928-5b5e00ddc76b"), description: "Line arrays, subwoofers, mixers and wireless mics" },
  { id: "lighting-led", name: "Lighting & LED", slug: "lighting-led", icon: "Lightbulb", image: img("1459749411175-04bf5292ceea"), description: "Moving heads, LED walls, lasers and stage lighting" },
  { id: "stage-furniture", name: "Stage, Tents & Furniture", slug: "stage-furniture", icon: "Tent", image: img("1464366400600-7168b8af9bc3"), description: "Stages, dance floors, tents, seating and tables" },
  // { id: "artists-performers", name: "Artists & Performers", slug: "artists-performers", icon: "Mic2", image: img("1598387993441-a364f854c3e1"), description: "Anchors, singers, dancers and celebrity acts" },
  // { id: "event-staff", name: "Hospitality & Staff", slug: "event-staff", icon: "Users", image: img("1514933651103-005eec06c04b"), description: "Bartenders, waiters, valets and event crew" },
];

export const FALLBACK_CITIES: CityDTO[] = [
  { id: "delhi-ncr", name: "Delhi NCR", slug: "delhi-ncr", state: "Delhi" },
  { id: "mumbai", name: "Mumbai", slug: "mumbai", state: "Maharashtra" },
  { id: "bengaluru", name: "Bengaluru", slug: "bengaluru", state: "Karnataka" },
  { id: "pune", name: "Pune", slug: "pune", state: "Maharashtra" },
  { id: "jaipur", name: "Jaipur", slug: "jaipur", state: "Rajasthan" },
  { id: "bhopal", name: "Bhopal", slug: "bhopal", state: "Madhya Pradesh" },
  { id: "hyderabad", name: "Hyderabad", slug: "hyderabad", state: "Telangana" },
  { id: "ahmedabad", name: "Ahmedabad", slug: "ahmedabad", state: "Gujarat" },
  { id: "lucknow", name: "Lucknow", slug: "lucknow", state: "Uttar Pradesh" },
  { id: "kolkata", name: "Kolkata", slug: "kolkata", state: "West Bengal" },
];

// Backend list when it answered with data, otherwise the fallback
export function orFallback<T>(data: T[] | undefined, fallback: T[]): T[] {
  return data && data.length > 0 ? data : fallback;
}
