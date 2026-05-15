import type { Metadata } from "next";
import { Geist, DM_Serif_Display, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Body sans — used for prose, labels, and (as fallback) numbers.
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Display serif for the hero headline + italicized accents.
const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

// Mono for all numeric values (return %, trade count, stat strip).
// IBM Plex Mono — geometric, distinctive, feels appropriate for finance.
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-number",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Chutithep — Analytical skill meets AI fluency",
  description:
    "A live quantitative trading system I built during my career gap. " +
    "Strategies researched, deployed, and killed — with the analysis behind each call.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${dmSerifDisplay.variable} ${ibmPlexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
