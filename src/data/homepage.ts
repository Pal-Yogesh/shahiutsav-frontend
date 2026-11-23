// Marketing content for the homepage. Dynamic data (categories, cities,
// vendors) comes from the backend API; this file holds editorial copy and
// photography only. Move to a CMS when content editing is needed.

const img = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const HERO = {
  image: img("1587271407850-8d438ca9fdf2"),
  alt: "Indian wedding mandap with chandeliers and floral stage décor",
  popular: [
    { label: "Wedding DJ", href: "/search?category=dj-entertainment" },
    { label: "Mandap décor", href: "/search?category=decoration" },
    { label: "Candid photographer", href: "/search?category=photography" },
    { label: "Sound on rent", href: "/search?category=sound-audio" },
  ],
} as const;

// Hero banner: one slide per occasion. The headline word, backdrop and the
// essentials card all follow the selected slide. `id` matches OCCASIONS ids.
export const HERO_SLIDES = [
  {
    id: "wedding",
    label: "Wedding",
    word: "wedding",
    image: img("1587271407850-8d438ca9fdf2"),
    alt: "Indian wedding mandap with chandeliers and floral stage décor",
    essentials: [
      { label: "Mandap & floral décor", image: img("1523438885200-e635ba2c371e") },
      { label: "DJ & sangeet sound", image: img("1574391884720-bbc3740c59d1") },
      { label: "Candid photography", image: img("1621621667797-e06afc217fb0") },
      { label: "Catering", image: img("1585937421612-70a008356fbe") },
    ],
  },
  {
    id: "birthday",
    label: "Birthday",
    word: "birthday",
    image: img("1504196606672-aef5c9cefc92"),
    alt: "Birthday party with candles and decorations",
    essentials: [
      { label: "Theme décor", image: img("1523438885200-e635ba2c371e") },
      { label: "DJ & speakers", image: img("1574391884720-bbc3740c59d1") },
      { label: "Photography", image: img("1621621667797-e06afc217fb0") },
      { label: "Cake & snacks", image: img("1585937421612-70a008356fbe") },
    ],
  },
  {
    id: "corporate",
    label: "Corporate",
    word: "launch",
    image: img("1511578314322-379afb476865"),
    alt: "Conference hall set up for a corporate event",
    essentials: [
      { label: "Stage & LED wall", image: img("1459749411175-04bf5292ceea") },
      { label: "Conference audio", image: img("1524368535928-5b5e00ddc76b") },
      { label: "Anchor & emcee", image: img("1598387993441-a364f854c3e1") },
      { label: "Catering", image: img("1555244162-803834f70033") },
    ],
  },
  {
    id: "college",
    label: "College Fest",
    word: "fest",
    image: img("1533174072545-7a4b6ad7a6c3"),
    alt: "Crowd celebrating at a college festival concert",
    essentials: [
      { label: "Concert sound", image: img("1524368535928-5b5e00ddc76b") },
      { label: "Moving-head lighting", image: img("1459749411175-04bf5292ceea") },
      { label: "Artists & DJs", image: img("1598387993441-a364f854c3e1") },
      { label: "Stage & truss", image: img("1464366400600-7168b8af9bc3") },
    ],
  },
  {
    id: "party",
    label: "Private Party",
    word: "party",
    image: img("1505236858219-8359eb29e329"),
    alt: "Evening party with warm lights and guests",
    essentials: [
      { label: "DJ", image: img("1574391884720-bbc3740c59d1") },
      { label: "Mood lighting", image: img("1459749411175-04bf5292ceea") },
      { label: "Bartenders", image: img("1514933651103-005eec06c04b") },
      { label: "Live counters", image: img("1555244162-803834f70033") },
    ],
  },
] as const;

export const MARQUEE = [
  "Weddings", "Sangeet", "Haldi", "Receptions", "Birthdays", "Corporate Galas",
  "College Fests", "Concerts", "Engagements", "Anniversaries", "House Parties",
] as const;

export const INTRO_IMAGES = {
  dj: img("1574391884720-bbc3740c59d1"),
  decor: img("1523438885200-e635ba2c371e"),
  food: img("1585937421612-70a008356fbe"),
} as const;

export const OCCASIONS = [
  {
    id: "wedding",
    label: "Wedding",
    title: "The Grand Wedding",
    description: "From the haldi to the reception: décor, music, food and memories, coordinated across every function.",
    image: img("1597157639073-69284dc0fdaf"),
    includes: ["Mandap & floral décor", "DJ & sangeet sound", "Candid photography", "Catering", "Stage lighting"],
    href: "/search?q=wedding",
  },
  {
    id: "birthday",
    label: "Birthday",
    title: "The Birthday Celebration",
    description: "Themed décor, a party-ready sound system and a photographer to capture every candle.",
    image: img("1504196606672-aef5c9cefc92"),
    includes: ["Balloon & theme décor", "DJ & speakers", "Photography", "Cake & snacks"],
    href: "/search?q=birthday",
  },
  {
    id: "corporate",
    label: "Corporate",
    title: "The Corporate Event",
    description: "Launches, conferences and annual galas with production that runs to the minute.",
    image: img("1511578314322-379afb476865"),
    includes: ["Stage & LED wall", "Conference audio", "Anchor / emcee", "Catering"],
    href: "/search?q=corporate",
  },
  {
    id: "college",
    label: "College Fest",
    title: "The College Fest",
    description: "Concert-grade sound, lights and artists for the nights your campus will talk about.",
    image: img("1533174072545-7a4b6ad7a6c3"),
    includes: ["Concert sound", "Moving-head lighting", "Artists & DJs", "Stage & truss"],
    href: "/search?q=college",
  },
  {
    id: "party",
    label: "Private Party",
    title: "The Private Party",
    description: "Rooftops, farmhouses and living rooms: everything for an evening your guests remember.",
    image: img("1505236858219-8359eb29e329"),
    includes: ["DJ", "Mood lighting", "Bartenders", "Live counters"],
    href: "/search?q=party",
  },
] as const;

export const STEPS = [
  {
    title: "Discover",
    tagline: "Tell us the occasion. We show you who can make it happen.",
    description: "Browse verified professionals and rental equipment in your city, filtered by your date and event type.",
    points: ["Search by city and event date", "Only vendors free on your date", "DJs, décor, photography, catering and more"],
    image: img("1523438885200-e635ba2c371e"),
  },
  {
    title: "Compare",
    tagline: "Every package, side by side. No phone calls.",
    description: "Look at portfolios, packages, reviews and prices together, with inclusions and extra charges spelled out.",
    points: ["Real portfolios and past events", "Clear package inclusions", "Upfront pricing, no surprises"],
    image: img("1621621667797-e06afc217fb0"),
  },
  {
    title: "Book",
    tagline: "One event. Every vendor. A single confirmation.",
    description: "Pick your services for the same date and venue, pay a small advance and get everything confirmed in one booking.",
    points: ["Several vendors in one booking", "Secure advance payment", "Cancellation terms shown before you pay"],
    image: img("1597157639073-69284dc0fdaf"),
  },
  {
    title: "Celebrate",
    tagline: "You enjoy the night. They handle the details.",
    description: "Your vendors arrive on time and set up, and a real person is there to help if plans change on the day.",
    points: ["Booking assistance on the day", "Rate and review your vendors", "Memories that last"],
    image: img("1533174072545-7a4b6ad7a6c3"),
  },
] as const;

export const BENEFITS = [
  { icon: "BadgeCheck", title: "Verified professionals", description: "Vendors are checked for identity, portfolio and equipment before they get a verified badge." },
  { icon: "IndianRupee", title: "Transparent pricing", description: "Package inclusions, hours and extra charges shown upfront." },
  { icon: "CalendarCheck", title: "Easy online booking", description: "Send requests and confirm bookings without endless phone calls." },
  { icon: "LayoutGrid", title: "Every service in one place", description: "DJ, décor, food and photography for the same date, in one booking." },
  { icon: "LockKeyhole", title: "Secure payments", description: "Advance payments with clear cancellation and refund terms." },
  { icon: "Headset", title: "Booking assistance", description: "A real person to help when plans change." },
] as const;

export const WHY_IMAGES = {
  main: img("1617627143750-d86bc21e42bb"),
  detail: img("1465495976277-4387d4b0b4c6"),
} as const;

export const GALLERY = [
  { label: "Wedding rituals", image: img("1597157639073-69284dc0fdaf"), ratio: "portrait" },
  { label: "Floral décor", image: img("1523438885200-e635ba2c371e"), ratio: "square" },
  { label: "Pre-wedding shoot", image: img("1621621667797-e06afc217fb0"), ratio: "portrait" },
  { label: "Corporate gala", image: img("1511578314322-379afb476865"), ratio: "landscape" },
  { label: "Concert lighting", image: img("1459749411175-04bf5292ceea"), ratio: "portrait" },
  { label: "Indian cuisine", image: img("1585937421612-70a008356fbe"), ratio: "landscape" },
  { label: "Bridal portraits", image: img("1617627143750-d86bc21e42bb"), ratio: "portrait" },
  { label: "Celebrations", image: img("1533174072545-7a4b6ad7a6c3"), ratio: "square" },
] as const;

export const VENDOR_CTA = {
  image: img("1598387993441-a364f854c3e1"),
  benefits: [
    "Reach customers planning events in your city",
    "Showcase your portfolio, packages and equipment",
    "Manage enquiries and bookings in one place",
    "Build a reputation with verified reviews",
  ],
} as const;

// Sample content for development. Replace with real reviews before launch.
export const TESTIMONIALS = [
  {
    name: "Priya S.",
    event: "Wedding",
    city: "Jaipur",
    text: "Décor, DJ and photographer all came through one booking. On the day, everything simply worked, and we actually got to enjoy our own wedding.",
    booked: ["Mandap décor", "DJ & sound", "Candid photography"],
    image: img("1597157639073-69284dc0fdaf"),
  },
  {
    name: "Rahul V.",
    event: "Product launch",
    city: "Pune",
    text: "The LED wall and sound team arrived early, tested everything twice and stayed until the last guest left. Our launch ran to the minute.",
    booked: ["LED wall", "Conference audio", "Stage & truss"],
    image: img("1511578314322-379afb476865"),
  },
  {
    name: "Anjali G.",
    event: "Birthday",
    city: "Bhopal",
    text: "We compared three decorators in one evening and booked the one with the clearest package. No surprise charges, no endless calls.",
    booked: ["Theme décor", "DJ & speakers", "Photography"],
    image: img("1505236858219-8359eb29e329"),
  },
] as const;

export const FAQS = [
  { question: "How do I book a DJ?", answer: "Search DJs in your city, compare profiles and packages, then send a booking request. You confirm once the DJ accepts." },
  { question: "Can I rent sound equipment without a DJ?", answer: "Yes. Speakers, mixers, microphones and lighting can be rented on their own, with an optional technician." },
  { question: "Can I book multiple services for one event?", answer: "Yes. Add a DJ, decorator, photographer and caterer to the same event and manage them in one booking." },
  { question: "Are vendors verified?", answer: "Vendors with a verified badge have passed identity, portfolio and equipment checks." },
  { question: "How do advance payments work?", answer: "A partial advance secures your date. The balance is settled with the vendor before or on the event day." },
  { question: "Can I cancel a booking?", answer: "Yes. Each vendor shows its cancellation terms before you confirm." },
  { question: "How do I register as a vendor?", answer: "Choose 'List your business', create a profile and submit your portfolio for verification." },
  { question: "Do you serve my city?", answer: "We are launching city by city. The city selector in search lists every city we cover today." },
] as const;

export const FINAL_CTA_IMAGE = img("1464047736614-af63643285bf");
