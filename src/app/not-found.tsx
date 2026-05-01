import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found — BiruniMap",
  description: "The page you were looking for doesn't exist. Explore Iranian businesses, events and community resources on BiruniMap.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-8xl mb-6">🗺️</p>
      <h1 className="text-4xl font-bold text-gray-900 mb-3">Page not found</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you were looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on the map.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl text-white font-semibold"
          style={{ backgroundColor: "#1B3A6B" }}
        >
          Explore businesses
        </Link>
        <Link
          href="/events"
          className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
        >
          Browse events
        </Link>
      </div>
    </div>
  );
}
