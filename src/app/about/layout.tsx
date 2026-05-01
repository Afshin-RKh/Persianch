import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About BiruniMap | The Global Iranian Diaspora Map",
  description: "BiruniMap is inspired by Al-Biruni, the 11th-century Persian polymath. Our mission: map every Iranian-owned business and community event worldwide.",
  alternates: { canonical: "https://birunimap.com/about" },
  openGraph: {
    title: "About BiruniMap | The Global Iranian Diaspora Map",
    description: "Inspired by Al-Biruni — mapping every Iranian-owned business and community event worldwide.",
    url: "https://birunimap.com/about",
    type: "website",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
