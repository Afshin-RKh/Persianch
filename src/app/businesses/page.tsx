import { Suspense } from "react";
import type { Metadata } from "next";
import BusinessesContent from "./BusinessesContent";

export const metadata: Metadata = {
  title: "Iranian Businesses Worldwide | BiruniMap",
  description: "Find Iranian-owned restaurants, doctors, lawyers, shops and more across 50+ countries. Discover and support the global Iranian business community.",
  alternates: { canonical: "https://birunimap.com/businesses" },
  openGraph: {
    title: "Iranian Businesses Worldwide | BiruniMap",
    description: "Find Iranian-owned restaurants, doctors, lawyers, shops and more across 50+ countries.",
    url: "https://birunimap.com/businesses",
    type: "website",
  },
};

export default function BusinessesPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>} >
      <BusinessesContent />
    </Suspense>
  );
}
