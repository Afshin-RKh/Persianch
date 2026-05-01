import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iranian Community Events Worldwide | BiruniMap",
  description: "Browse Iranian and Persian community events — concerts, festivals, cultural gatherings, and more across 50+ countries.",
  alternates: { canonical: "https://birunimap.com/events" },
  openGraph: {
    title: "Iranian Community Events Worldwide | BiruniMap",
    description: "Browse Iranian and Persian community events — concerts, festivals, cultural gatherings, and more across 50+ countries.",
    url: "https://birunimap.com/events",
    type: "website",
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
