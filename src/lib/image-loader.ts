"use client";

type LoaderArgs = { src: string; width: number; quality?: number };

// Resize at the source CDN instead of the Next.js optimizer: faster and
// avoids Vercel free-tier image optimization limits.
export default function imageLoader({ src, width, quality }: LoaderArgs): string {
  const q = quality ?? 75;

  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(q));
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    return url.toString();
  }

  if (src.includes("res.cloudinary.com") && src.includes("/upload/")) {
    return src.replace("/upload/", `/upload/w_${width},q_${q},f_auto/`);
  }

  return src;
}
