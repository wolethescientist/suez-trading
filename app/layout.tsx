import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: `${site.legalName} — Petroleum, Materials & Logistics`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "petroleum products Nigeria", "diesel supplier Abuja", "AGO supply",
    "building materials Nigeria", "cement supplier", "haulage Nigeria",
    "Suez Trading Internationale",
  ],
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: site.legalName,
    title: `${site.legalName} — Petroleum, Materials & Logistics`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NG" className={plexMono.variable}>
      <head>
        {/* Zodiak and Switzer come from Fontshare, matching Suez Electric and
            Suez Gas. Preconnect so the display face is not the last thing in. */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=zodiak@400,500,700&f[]=switzer@400,500,600,700&display=swap"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
