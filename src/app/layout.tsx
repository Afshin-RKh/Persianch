import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PersianHub — Persian & Iranian Businesses Across Europe",
  description:
    "Find Persian, Afghan and Tajik restaurants, doctors, lawyers, hairdressers and more across Europe. The go-to directory for the Persian-speaking community in Europe.",
  keywords: ["Persian businesses Europe", "Iranian restaurants Europe", "Afghan businesses Europe", "Persian community Europe", "Farsi speaking businesses"],
  openGraph: {
    title: "PersianHub — Persian & Iranian Businesses Across Europe",
    description: "The go-to directory for Persian, Afghan and Tajik businesses across Europe — restaurants, doctors, lawyers and more.",
    siteName: "PersianHub",
    locale: "en_GB",
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
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
