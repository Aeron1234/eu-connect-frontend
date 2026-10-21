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

async function withDeadline(operation, timeoutMs, message) {
  const controller = new AbortController();
  const error = routeError(message, 504);
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => { controller.abort(error); reject(error); }, timeoutMs);
  });
  try { return await Promise.race([operation(controller.signal), deadline]); }
  finally { clearTimeout(timer); }
}

export async function requestMapRoute(read, internshipId, origin, timeoutMs = 25000, fetcher = fetch, intervalMs = 1100, fallback = null) {
  // A slower authenticated lookup must not consume the provider's time budget.
  let result = await withDeadline(signal => read(internshipId, origin, { signal }), timeoutMs,
    'The company route lookup timed out. Try again or use Google Maps.');
  if (result?.client_route === true) {
    if (!validPoint(result.origin) || !validPoint(result.destination)) throw routeError('The company route has invalid coordinates. Refresh the map.');
    try {
      result = await withDeadline(async signal => {
        const wait = Math.max(0, nextPublicRequestAt - Date.now());
        if (wait > timeoutMs) throw routeError('Routing is busy. Wait a moment and try again.');
        nextPublicRequestAt = Date.now() + wait + intervalMs;
        if (wait) await new Promise(resolve => setTimeout(resolve, wait));
        if (signal.aborted) throw signal.reason;
        const { origin: start, destination: end } = result;
        // This fixed public endpoint receives coordinates only, never the session token.
        const url = new URL('https://routing.openstreetmap.de/routed-car/route/v1/driving/' + start.lng + ',' + start.lat + ';' + end.lng + ',' + end.lat);
        url.search = new URLSearchParams({ overview: 'full', geometries: 'geojson', steps: 'false' });
        let response;
        try {
          response = await fetcher(url, { signal, mode: 'cors', credentials: 'omit', headers: { Accept: 'application/json' } });
        } catch {
          if (signal.aborted) throw signal.reason;
          throw routeError('Your browser could not connect to the routing service. Try Google Maps directions.');
        }
        if (!response.ok) throw routeError('The routing service is unavailable. Try again or use Google Maps.');
        let data;
        try { data = await response.json(); }
        catch {
          if (signal.aborted) throw signal.reason;
          throw routeError('The routing service returned an invalid response. Try again or use Google Maps.');
        }
        if (data.code === 'NoRoute' || data.code === 'NoSegment') throw routeError('No connected driving route was found. Try Google Maps directions.', 422);
        const route = data.code === 'Ok' ? data.routes?.[0] : null;
        return { ...result, geometry: route?.geometry, distance_meters: route?.distance, duration_seconds: route?.duration, attribution: 'Routing: OSRM / FOSSGIS · OpenStreetMap contributors' };
      }, Math.min(timeoutMs, 10000), 'The road routing service timed out. Try again or use Google Maps.');
      if (!validRoute(result)) throw routeError('The routing service returned an invalid road route. Try again or use Google Maps.');
    } catch (error) {
      // Retry network/provider failures through Vercel, never authorization or NoRoute errors.
      if (!fallback || error.status < 500) throw error;
      result = await withDeadline(signal => fallback(internshipId, origin, { signal }), timeoutMs + Math.min(timeoutMs, 15000),
        'The fallback routing request timed out. Try again or use Google Maps.');
    }
  }
  if (!validRoute(result)) throw routeError(result?.error || 'Could not load the road route. Use Google Maps directions instead.', result?.status || 503);
  return result;
}
