import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog & Community Guides | BiruniMap",
  description: "Survival guides, legal tips, travel advice, and community stories for Iranians living abroad — written by the diaspora, for the diaspora.",
  alternates: { canonical: "https://birunimap.com/blog" },
  openGraph: {
    title: "Blog & Community Guides | BiruniMap",
    description: "Survival guides, legal tips, travel advice, and community stories for Iranians living abroad.",
    url: "https://birunimap.com/blog",
    type: "website",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
