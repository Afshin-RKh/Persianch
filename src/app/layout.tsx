import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BiruniMap — Iranian Businesses & Events Worldwide",
  description:
    "Discover Iranian-owned businesses, community events and resources worldwide — restaurants, doctors, lawyers, concerts and more. The global map of the Iranian diaspora, inspired by Al-Biruni.",
  keywords: ["Iranian businesses worldwide", "Persian diaspora map", "Iranian community events", "Farsi speaking businesses", "BiruniMap", "Al-Biruni", "Iranian events Europe", "Persian community"],
  metadataBase: new URL("https://birunimap.com"),
  alternates: { canonical: "https://birunimap.com" },
  openGraph: {
    title: "BiruniMap — Businesses, Events & Community for the Iranian Diaspora",
    description: "Businesses, community events and resources for Iranians worldwide — mapped and growing across 50+ countries.",
    siteName: "BiruniMap",
    locale: "en_GB",
    type: "website",
    images: [{ url: "https://birunimap.com/og-image.svg", width: 1200, height: 630, alt: "BiruniMap — Iranian diaspora businesses on the map" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BiruniMap — The Global Map of the Iranian Diaspora",
    description: "3,000+ Iranian-owned businesses across 50+ countries.",
    images: ["https://birunimap.com/og-image.svg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <head>
        {/* Persian & Arabic Google Fonts for the rich text editor */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&family=Estedad:wght@100..900&family=Lalezar&display=swap" rel="stylesheet" />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-R71GKWRRVM" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-R71GKWRRVM');
        `}</Script>
        <Script id="org-jsonld" type="application/ld+json" strategy="afterInteractive">{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "BiruniMap",
            "url": "https://birunimap.com",
            "logo": "https://birunimap.com/og-image.svg",
            "description": "The global map of the Iranian diaspora — discover Iranian-owned businesses, community events, and resources worldwide.",
            "sameAs": ["https://instagram.com/birunimap", "https://www.linkedin.com/company/birunimap"]
          }
        `}</Script>
        <Script id="website-jsonld" type="application/ld+json" strategy="afterInteractive">{`
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "BiruniMap",
            "url": "https://birunimap.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://birunimap.com/businesses?search={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          }
        `}</Script>
      </head>
      <body className="min-h-full flex flex-col bg-gray-50">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
