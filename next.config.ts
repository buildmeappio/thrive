import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: "/admin",
  images: {
    path: '/admin/_next/image'
  }
};

export default nextConfig;
