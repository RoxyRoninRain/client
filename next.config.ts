import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ividnhcvwpqnhfroxuxp.supabase.co",
      },
    ],
  },
};

export default nextConfig;
