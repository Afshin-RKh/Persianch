import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Details | BiruniMap",
  description: "Discover this Iranian community event on BiruniMap — date, venue, and details.",
  openGraph: {
    siteName: "BiruniMap",
    type: "website",
    images: [{ url: "https://birunimap.com/og-image.svg", width: 1200, height: 630, alt: "BiruniMap Events" }],
  },
};

export default function EventDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
