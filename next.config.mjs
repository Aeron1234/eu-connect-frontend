/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eu-connect-frontend.vercel.app",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    staleTimes: {
      dynamic: 60, // seconds dynamic routes stay fresh in Router Cache
      static: 180,
    },
  },

  async rewrites() {
    const SOCKET_URL =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:7000";
    return [
      {
        source: "/eu-connect/api/:path*",
        destination: `${SOCKET_URL}/eu-connect/api/:path*`,
      },
    ];
  },

  reactCompiler: true,
};

export default nextConfig;
