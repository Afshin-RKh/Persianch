import { Suspense } from "react";
import type { Metadata } from "next";
import BusinessesContent from "./businesses/BusinessesContent";

export const metadata: Metadata = {
  title: "BiruniMap — Businesses, Events & Community for the Iranian Diaspora",
  description: "Discover Iranian-owned businesses, community events and resources worldwide — restaurants, doctors, lawyers, concerts and more.",
  alternates: { canonical: "https://birunimap.com" },
  openGraph: {
    title: "BiruniMap — Businesses, Events & Community for the Iranian Diaspora",
    description: "Discover Iranian-owned businesses, community events and resources worldwide.",
    url: "https://birunimap.com",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <BusinessesContent />
    </Suspense>
  );
}
