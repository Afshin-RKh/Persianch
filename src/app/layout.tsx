import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BiruniMap — The Global Map of the Iranian Diaspora",
  description:
    "Discover 3,000+ Iranian-owned businesses worldwide — restaurants, doctors, lawyers, hairdressers and more. Inspired by Al-Biruni, the Persian scholar who mapped the world.",
  keywords: ["Iranian businesses worldwide", "Persian diaspora map", "Iranian community", "Farsi speaking businesses", "BiruniMap", "Al-Biruni"],
  openGraph: {
    title: "BiruniMap — The Global Map of the Iranian Diaspora",
    description: "3,000+ Iranian-owned businesses across 50+ countries, mapped for the global Iranian community.",
    siteName: "BiruniMap",
    locale: "en_GB",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-R71GKWRRVM" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-R71GKWRRVM');
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
