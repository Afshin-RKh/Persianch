import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/persianch",
  assetPrefix: "/persianch",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
