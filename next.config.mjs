/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },

  reactCompiler: true,
};

export default nextConfig;
