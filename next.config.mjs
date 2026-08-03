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
  },

  async rewrites() {
    return [
      {
        source: "/eu-connect/api/:path*",
        destination: "https://your-app-name.onrender.com/eu-connect/api/:path*",
      },
    ];
  },

  reactCompiler: true,
};

export default nextConfig;
