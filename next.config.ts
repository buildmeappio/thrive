import type { NextConfig } from "next";

const cdnUrl =
  process.env.NEXT_PUBLIC_CDN_URL || "https://assets.thriveassessmentcare.com";
const protocol = cdnUrl.startsWith("https") ? "https" : "http";
const hostname = cdnUrl.split("//")[1];

const nextConfig: NextConfig = {
  /* config options here */
  basePath: "/admin",
  images: {
    remotePatterns: [
      {
        protocol: protocol,
        hostname: hostname,
      },
    ],
  }
};

export default nextConfig;
