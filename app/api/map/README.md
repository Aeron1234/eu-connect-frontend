# Authenticated map routing

Deploy these frontend changes to Vercel. No new environment variable or API key is required. The backend must already support the authenticated student-map route endpoint with prepare=1. Existing API_BASE_URL remains the backend URL; MAP_ROUTING_BASE_URL remains an optional backend setting for a dedicated OSRM-compatible provider.

Route reads now use GET /api/map/route/:internshipId instead of the browser's Server Action queue. The handler uses the existing HTTP-only session and backend lookup. The backend rechecks staff access, ongoing status and saved destination for every request. Caller-supplied destinations and provider URLs are never accepted. Responses are private, no-store.

For the default public provider, the browser first tries OSRM for up to 10 seconds. Network failures, provider errors or timeouts trigger one same-origin request with server_route=1. After another authenticated backend lookup, that handler requests the same fixed public service from Vercel. Browser and Vercel requests send coordinates without account credentials. A disconnected road route (422) or denied/expired access does not trigger another provider request. Custom backend provider results continue to work without contacting the default public provider.

Lookup, browser routing and fallback have separate client deadlines: 25, 10 and 40 seconds. The existing backend fetch is capped at 20 seconds. The Vercel public provider request is capped at 15 seconds including queue wait and body reads. All failure paths terminate loading and preserve Google Maps directions. There is no substitute straight-line route.

The Vercel fallback serializes provider calls at 1.1-second intervals per function instance, bounds the queue at 10, and caches up to 200 successful campus routes for an hour. Every cache use follows a fresh backend authorization/location check. Live viewer routes bypass the shared cache and single-flight map. This memory is per instance, not a distributed rate limit; a dedicated provider is appropriate for heavier traffic.

Connectivity to a public routing service is best effort. A successful localhost route does not prove browser or Vercel connectivity in production. Use the explicit stage-specific error message and Network entries to distinguish application lookup failures, browser provider failures and fallback provider failures. Google Maps stays available independently.

The GET handler enforces a 22-second lookup deadline covering session refresh, a 16-second fallback-stage deadline, and a 38-second total deadline. These bounds also apply when opening the endpoint directly in a browser. A late lookup cannot start a provider request after the response has timed out. Error JSON includes `stage` (`lookup` or `provider`) and a safe `code`, such as `MAP_ROUTE_LOOKUP_TIMEOUT` or `ROUTING_UNAVAILABLE`, without tokens or connection details. These deadlines do not make an unreachable public provider available.
