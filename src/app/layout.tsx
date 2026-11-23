import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MotionProvider } from "@/components/motion/motion-provider";
import { ScrollProgress, SmoothScroll } from "@/components/motion/smooth-scroll";
import { APP_NAME } from "@/config/constants";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME}: Book DJs, Décor, Photography & Event Equipment`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Discover and book India's finest event professionals, entertainment and rental services, all in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // No fixed height on <html>: it must grow with the page so smooth scrolling
    // notices when content loads in and the page gets longer
    <html lang="en" className={`${manrope.variable} ${cormorant.variable} antialiased`}>
      <body className="flex min-h-svh flex-col">
        <MotionProvider>
          <SmoothScroll />
          <ScrollProgress />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
