import type { NextConfig } from "next";

const cdnUrl = "https://assets.thriveassessmentcare.com";
const protocol = cdnUrl.startsWith("https") ? "https" : "http";
const hostname = cdnUrl.split("//")[1];

console.log({ protocol, hostname });

const nextConfig: NextConfig = {
  /* config options here */
  basePath: "/examiner",
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
