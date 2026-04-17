import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PersianCH — Persian Businesses in Switzerland",
  description:
    "Find Persian restaurants, doctors, lawyers, hairdressers and more in Switzerland. The largest directory of Iranian businesses in Switzerland.",
  keywords: ["Persian businesses Switzerland", "Iranian restaurants Zurich", "ایرانی سوئیس"],
  openGraph: {
    title: "PersianCH — Persian Businesses in Switzerland",
    description: "The largest directory of Iranian businesses in Switzerland.",
    siteName: "PersianCH",
    locale: "en_CH",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
