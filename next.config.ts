import type { NextConfig } from "next";

const cdnUrl =
  process.env.NEXT_PUBLIC_CDN_URL || "https://assets.thriveassessmentcare.com";
const protocol = cdnUrl.startsWith("https") ? "https" : "http";
const hostname = cdnUrl.split("//")[1];

const nextConfig: NextConfig = {
  /* config options here */
  basePath: "/admin",
  async rewrites() {
    return [
      {
        source: "/admin/password/set",
        destination: "/password/set",
      },
      {
        source: "/admin/password/set/:path*",
        destination: "/password/set/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: protocol,
        hostname: hostname,
      },
    ],
  },
};

export default nextConfig;
