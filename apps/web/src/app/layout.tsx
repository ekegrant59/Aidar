import type { Metadata, Viewport } from "next";
import { Sora, Manrope, Inter } from "next/font/google";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--ff-sora",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--ff-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--ff-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getaidar.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Aidar | Find and Book Verified Care in Nigeria",
  description:
    "Bridge the trust gap. Connect with verified practitioners for clinic visits, home visits, or virtual consultations. Join the Aidar waitlist.",
  keywords: [
    "Aidar",
    "Nigeria healthcare",
    "Lagos doctors",
    "verified practitioners",
    "book doctor Nigeria",
    "home care Lagos",
    "telemedicine Nigeria",
  ],
  openGraph: {
    title: "Aidar | Find and Book Verified Care in Nigeria",
    description:
      "Connect with verified practitioners for clinic, home, or virtual care. Join the waitlist.",
    url: siteUrl,
    siteName: "Aidar",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aidar | Find and Book Verified Care in Nigeria",
    description:
      "Connect with verified practitioners for clinic, home, or virtual care. Join the waitlist.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b4242",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable} ${inter.variable}`}>
      <body className="antialiased">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
