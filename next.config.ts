import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: "/examiner",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "public-thrive-assets.s3.eu-north-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
