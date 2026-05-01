import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Details | BiruniMap",
  description: "Explore this Iranian-owned business on BiruniMap — contact details, location, reviews, and more.",
  openGraph: {
    siteName: "BiruniMap",
    type: "website",
    images: [{ url: "https://birunimap.com/og-image.svg", width: 1200, height: 630, alt: "BiruniMap" }],
  },
};

export default function BusinessDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
