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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
    localPatterns: [
      { pathname: "/posters/**" },
      { pathname: "/examples/**" },
      { pathname: "/uploads/**" },
    ],
  },
};

export default nextConfig;
