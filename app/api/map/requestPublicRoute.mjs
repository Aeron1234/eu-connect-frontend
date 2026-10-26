import { createRouteProviderRequester } from './routeProviderRequest.mjs';

// Reuse validated campus geometry for one hour with at most 200 entries and
// coalesce identical pending work within this instance. Authorization happens
// before this router is called, including for geometry-cache hits.
export function createPublicMapRouter({ requester = createRouteProviderRequester({ timeoutMs: 15000 }), fetcher = fetch } = {}) {
  const routes = new Map();
  const pending = new Map();
  return async function publicMapRoute(descriptor, { cache = true } = {}) {
    const { origin, destination } = descriptor;
    if ([origin, destination].some(point => !point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng) || Math.abs(point.lat) > 90 || Math.abs(point.lng) > 180)) {
      throw Object.assign(new Error('The company route has invalid coordinates. Refresh the map.'), { status: 422 });
    }
    const coordinates = origin.lng + ',' + origin.lat + ';' + destination.lng + ',' + destination.lat;
    const cached = cache && routes.get(coordinates);
    if (cached && cached.expires > Date.now()) return { ...descriptor, ...cached.route };
    async function calculate() {
      const data = await requester('route/v1/driving/' + coordinates + '?overview=full&geometries=geojson&steps=false', fetcher,
        'https://routing.openstreetmap.de/routed-car/');
      const route = data.routes?.[0];
      const points = route?.geometry?.coordinates;
      if (route?.geometry?.type !== 'LineString' || !Array.isArray(points) || points.length < 2 || points.length > 100000 ||
          points.some(point => !Array.isArray(point) || !Number.isFinite(point[0]) || !Number.isFinite(point[1]) || Math.abs(point[0]) > 180 || Math.abs(point[1]) > 90) ||
          !Number.isFinite(route.distance) || route.distance < 0 || !Number.isFinite(route.duration) || route.duration < 0) {
        throw Object.assign(new Error('The routing service returned an invalid road route. Try Google Maps directions.'), { status: 503 });
      }
      const result = { geometry: route.geometry, distance_meters: route.distance, duration_seconds: route.duration,
        attribution: 'Routing: OSRM / FOSSGIS · OpenStreetMap contributors' };
      if (cache) {
        if (routes.size >= 200) routes.delete(routes.keys().next().value);
        routes.set(coordinates, { route: result, expires: Date.now() + 3600000 });
      }
      return result;
    }
    // Viewer coordinates are never retained in this shared cache or pending map.
    if (!cache) return { ...descriptor, ...await calculate() };
    let operation = pending.get(coordinates);
    if (!operation) {
      operation = calculate().finally(() => pending.delete(coordinates));
      pending.set(coordinates, operation);
    }
    return { ...descriptor, ...await operation };
  };
}

export const requestPublicRoute = createPublicMapRouter();
