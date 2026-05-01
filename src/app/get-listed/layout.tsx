import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Your Iranian Business | BiruniMap",
  description: "List your Iranian or Persian business on BiruniMap and get discovered by the global diaspora. Free to add — restaurants, shops, services, and more.",
  alternates: { canonical: "https://birunimap.com/get-listed" },
  openGraph: {
    title: "Add Your Iranian Business | BiruniMap",
    description: "List your Iranian or Persian business on BiruniMap and get discovered by the global diaspora. Free to add.",
    url: "https://birunimap.com/get-listed",
    type: "website",
  },
};

export default function GetListedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
