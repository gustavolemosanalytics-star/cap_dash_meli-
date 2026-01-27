import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scontent-fra5-1.xx.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'scontent-fra5-2.xx.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'scontent-fra3-2.xx.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'scontent.xx.fbcdn.net',
      },
    ],
    // Allow all external images during development
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
