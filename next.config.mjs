import { getApiBaseUrl } from "./lib/api-base-url.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Node-host configuration for images, server-action transport and report bundles.
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
      // This Server Action transport cap is separate from backend JSON/multipart limits.
      // Feature validation still enforces its smaller file/count/type policies.
      bodySizeLimit: "50mb",
    },
    staleTimes: {
      dynamic: 60, // seconds dynamic routes stay fresh in Router Cache
      static: 300,
    },
  },

  async rewrites() {
    // Normalize one backend API base for both canonical and legacy rewrites. The
    // server setting takes precedence over the socket URL and localhost fallback.
    const backendApi = getApiBaseUrl(
      process.env.API_BASE_URL || process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:7000",
    );
    return [
      { source: "/api/v1/:path*", destination: `${backendApi}/:path*` },
      { source: "/eu-connect/api/:path*", destination: `${backendApi}/:path*` },
    ];
  },

  serverExternalPackages: ["@sparticuz/chromium"],

  // Include packaged Chromium in each report route's traced deployment files.
  // The PDF runtime still chooses Vercel versus other Node hosts at execution time.
  outputFileTracingIncludes: {
    "/api/reports/annex-c": ["./node_modules/@sparticuz/chromium/**"],
    "/api/reports/annex-d": ["./node_modules/@sparticuz/chromium/**"],
    "/api/reports/student-evaluation": [
      "./node_modules/@sparticuz/chromium/**",
    ],
    "/api/reports/summary-report": ["./node_modules/@sparticuz/chromium/**"],
    "/api/reports/weekly-narratives": ["./node_modules/@sparticuz/chromium/**"],
  },

  reactCompiler: true,
};

export default nextConfig;
