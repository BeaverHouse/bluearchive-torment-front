import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'twauaebyyujvvvusbrwe.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
    ],
  },
};

export default nextConfig;
