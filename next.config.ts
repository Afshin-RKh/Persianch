import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    "@tiptap/react",
    "@tiptap/pm",
    "@tiptap/starter-kit",
    "@tiptap/extension-underline",
    "@tiptap/extension-color",
    "@tiptap/extension-text-style",
    "@tiptap/extension-link",
    "@tiptap/extension-text-align",
    "@tiptap/extension-highlight",
    "@tiptap/core",
    "@tiptap/extension-bold",
    "@tiptap/extension-italic",
    "@tiptap/extension-paragraph",
    "@tiptap/extension-document",
    "@tiptap/extension-text",
  ],
};

export default nextConfig;
