import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PersianHub — Persian Businesses in Switzerland",
  description:
    "Find Persian restaurants, doctors, lawyers, hairdressers and more in Switzerland. The largest directory of Iranian businesses in Switzerland.",
  keywords: ["Persian businesses Switzerland", "Iranian restaurants Zurich", "Persian community Switzerland"],
  openGraph: {
    title: "PersianHub — Persian Businesses in Switzerland",
    description: "The largest directory of Iranian businesses in Switzerland.",
    siteName: "PersianHub",
    locale: "en_CH",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-8757131R86" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-8757131R86');
        `}</Script>
      </head>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
