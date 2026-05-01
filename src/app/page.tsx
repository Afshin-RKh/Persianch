import { Suspense } from "react";
import type { Metadata } from "next";
import BusinessesContent from "./businesses/BusinessesContent";

export const metadata: Metadata = {
  title: "BiruniMap — Iranian Businesses, Events & Community Worldwide",
  description: "Discover Iranian-owned businesses, community events and resources worldwide — restaurants, doctors, lawyers, concerts and more. The global map of the Iranian diaspora.",
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
    <>
      <h1 className="sr-only">Iranian Businesses, Events &amp; Community Worldwide — BiruniMap</h1>
      <h2 className="sr-only">Find Iranian-owned businesses near you</h2>
      <h3 className="sr-only">Restaurants, doctors, lawyers, shops and more across 50+ countries</h3>
      <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
        <BusinessesContent />
      </Suspense>
    </>
  );
}
