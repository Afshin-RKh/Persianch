import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",        // Static HTML export for Namecheap shared hosting
  trailingSlash: true,     // Required for static hosting compatibility
  images: {
    unoptimized: true,     // Required for static export (no Next.js image server)
  },
};

export default nextConfig;
