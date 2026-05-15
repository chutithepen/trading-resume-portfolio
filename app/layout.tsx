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

const SITE_URL = "https://trading-resume-portfolio.vercel.app";
const SITE_TITLE = "Chutithep — Live quantitative trading portfolio";
const SITE_DESCRIPTION =
  "Senior data analyst on a career break. A live quantitative trading system I built using Claude — 23 strategies researched, 8 deployed, the rest killed. One worked example walked through end-to-end.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Chutithep's Trading Portfolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
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
