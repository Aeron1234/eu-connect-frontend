let nextPublicRequestAt = 0;
const routeError = (message, status = 503) => Object.assign(new Error(message), { status });
function validPoint(point) {
  return point && Number.isFinite(point.lat) && Number.isFinite(point.lng) && Math.abs(point.lat) <= 90 && Math.abs(point.lng) <= 180;
}
function validRoute(route) {
  const points = route?.geometry?.coordinates;
  return route?.geometry?.type === 'LineString' && Array.isArray(points) && points.length >= 2 && points.length <= 100000 &&
    points.every(point => Array.isArray(point) && validPoint({ lat: point[1], lng: point[0] })) &&
    Number.isFinite(route.distance_meters) && route.distance_meters >= 0 && Number.isFinite(route.duration_seconds) && route.duration_seconds >= 0;
}

export async function requestMapRoute(read, internshipId, origin, timeoutMs = 25000, fetcher = fetch, intervalMs = 1100) {
  let timer;
  const controller = new AbortController();
  const timeoutError = routeError('The route request timed out. Try again or use Google Maps.', 504);
  const deadline = new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(timeoutError); reject(timeoutError); }, timeoutMs); });
  async function calculate() {
    let result = await read(internshipId, origin);
    if (controller.signal.aborted) throw timeoutError;
    if (result?.client_route === true) {
      if (!validPoint(result.origin) || !validPoint(result.destination)) throw routeError('The company route has invalid coordinates. Refresh the map.');
      const wait = Math.max(0, nextPublicRequestAt - Date.now());
      if (wait > timeoutMs) throw routeError('Routing is busy. Wait a moment and try again.');
      nextPublicRequestAt = Date.now() + wait + intervalMs;
      if (wait) await new Promise(resolve => setTimeout(resolve, wait));
      if (controller.signal.aborted) throw timeoutError;
      const { origin: start, destination: end } = result;
      // This fixed public endpoint receives coordinates only, never the session token.
      const url = new URL('https://routing.openstreetmap.de/routed-car/route/v1/driving/' + start.lng + ',' + start.lat + ';' + end.lng + ',' + end.lat);
      url.search = new URLSearchParams({ overview: 'full', geometries: 'geojson', steps: 'false' });
      let response;
      try {
        response = await fetcher(url, { signal: controller.signal, mode: 'cors', credentials: 'omit', headers: { Accept: 'application/json' } });
      } catch {
        if (controller.signal.aborted) throw timeoutError;
        throw routeError('Your browser could not connect to the routing service. Try Google Maps directions.');
      }
      if (!response.ok) throw routeError('The routing service is unavailable. Try again or use Google Maps.');
      const data = await response.json();
      if (data.code === 'NoRoute' || data.code === 'NoSegment') throw routeError('No connected driving route was found. Try Google Maps directions.', 422);
      const route = data.code === 'Ok' ? data.routes?.[0] : null;
      result = { ...result, geometry: route?.geometry, distance_meters: route?.distance, duration_seconds: route?.duration, attribution: 'Routing: OSRM / FOSSGIS · OpenStreetMap contributors' };
    }
    if (!validRoute(result)) throw routeError(result?.error || 'Could not load the road route. Use Google Maps directions instead.', result?.status || 503);
    return result;
  }
  try { return await Promise.race([calculate(), deadline]); }
  finally { clearTimeout(timer); }
}
