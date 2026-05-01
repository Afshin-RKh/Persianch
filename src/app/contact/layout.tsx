import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Get Involved | BiruniMap",
  description: "Get in touch with BiruniMap, volunteer, partner with us, or share feedback. We're building the global Iranian diaspora directory together.",
  alternates: { canonical: "https://birunimap.com/contact" },
  openGraph: {
    title: "Contact & Get Involved | BiruniMap",
    description: "Get in touch, volunteer, or partner with BiruniMap — the global Iranian diaspora directory.",
    url: "https://birunimap.com/contact",
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
