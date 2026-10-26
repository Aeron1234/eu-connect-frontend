/** Full, versioned backend base. Only import this in server code/configuration. */
export function getApiBaseUrl(value = process.env.API_BASE_URL) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("API_BASE_URL must be configured with the backend URL ending in /api/v1.");
  }
  let url;
  try { url = new URL(value.trim()); }
  catch { throw new Error("API_BASE_URL must be an absolute HTTP or HTTPS URL."); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error("API_BASE_URL must be an HTTP or HTTPS base URL without credentials, query parameters, or a fragment.");
  }
  let pathname = url.pathname.replace(/\/+$/, "");
  if (/\/api\/v\d+$/.test(pathname) && !pathname.endsWith("/api/v1")) {
    throw new Error("API_BASE_URL must use API version v1.");
  }
  if (!pathname.endsWith("/api/v1")) {
    // Normalize supported legacy suffixes to /api/v1 while preserving any earlier
    // reverse-proxy path. This reads the server-only API_BASE_URL configuration.
    for (const suffix of ["/eu-connect/api", "/eu-connect", "/api"]) {
      if (pathname.endsWith(suffix)) {
        pathname = pathname.slice(0, -suffix.length);
        break;
      }
    }
    pathname += "/api/v1";
  }
  url.pathname = pathname;
  return url.toString().replace(/\/$/, "");
}
