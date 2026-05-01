import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Post | BiruniMap",
  description: "Community guides, survival tips, and stories from the Iranian diaspora worldwide.",
  openGraph: {
    siteName: "BiruniMap",
    type: "article",
    images: [{ url: "https://birunimap.com/og-image.svg", width: 1200, height: 630, alt: "BiruniMap Blog" }],
  },
};

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
