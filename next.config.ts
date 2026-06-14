import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/films/leo-temple-perdu",
        destination: "/films/super-leo",
        permanent: true,
      },
      {
        source: "/films/leo-planete-etoiles",
        destination: "/films/leo-ice-moon",
        permanent: true,
      },
    ];
  },
  experimental: {
    serverActions: {
      // Photos personnages jusqu'à 5 Mo (+ champs du formulaire)
      bodySizeLimit: "6mb",
    },
  },
  turbopack: {
    root: process.cwd(),
  },
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
    localPatterns: [
      { pathname: "/posters/**" },
      { pathname: "/examples/**" },
      { pathname: "/uploads/**" },
      { pathname: "/brand/**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/posters/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/videos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/brand/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
