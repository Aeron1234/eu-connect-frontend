function json(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
}
const validStatus = status => Number.isInteger(status) && status >= 400 && status <= 599;
const providerCodes = new Set(['ROUTING_TIMEOUT', 'ROUTING_UNAVAILABLE', 'ROUTING_BUSY', 'ROUTING_NO_ROUTE', 'ROUTING_CONFIGURATION']);

// Bound lookup, optional provider work and the overall response separately.
// Cancellation/deadlines settle the handler even if an underlying helper ignores
// abort; they do not guarantee that already-started I/O has stopped.
export function createMapRouteHandler({ read, route, lookupMs = 22000, providerMs = 16000, totalMs = 38000 }) {
  return async function GET(request, context) {
    let stage = 'lookup';
    const controller = new AbortController();
    const cancelled = Object.assign(new Error('The route request was cancelled.'), { status: 408, code: 'MAP_ROUTE_CANCELLED' });
    function timeout() {
      return Object.assign(new Error(stage === 'provider'
        ? 'The road routing service timed out. Try again or use Google Maps.'
        : 'The application server route lookup timed out. Try again or use Google Maps.'),
      { status: 504, code: stage === 'provider' ? 'ROUTING_TIMEOUT' : 'MAP_ROUTE_LOOKUP_TIMEOUT' });
    }
    let rejectAbort;
    const aborted = new Promise((_, reject) => { rejectAbort = reject; });
    const fail = () => rejectAbort(controller.signal.reason);
    controller.signal.addEventListener('abort', fail, { once: true });
    const relayCancel = () => controller.abort(cancelled);
    request.signal?.addEventListener('abort', relayCancel, { once: true });
    const totalTimer = setTimeout(() => controller.abort(timeout()), totalMs);
    async function step(operation, timeoutMs) {
      if (controller.signal.aborted) throw controller.signal.reason;
      const timer = setTimeout(() => controller.abort(timeout()), timeoutMs);
      try { return await Promise.race([operation(), aborted]); }
      finally { clearTimeout(timer); }
    }
    async function work() {
      if (controller.signal.aborted) throw controller.signal.reason;
      const { internshipId } = await context.params;
      if (controller.signal.aborted) throw controller.signal.reason;
      if (!/^[a-zA-Z0-9-]{1,64}$/.test(internshipId || '')) {
        return json({ error: 'A valid internship record is required.' }, 400);
      }
      const search = new URL(request.url).searchParams;
      const lat = search.get('origin_lat');
      const lng = search.get('origin_lng');
      let origin = null;
      if (lat !== null || lng !== null) {
        if (!lat?.trim() || !lng?.trim() || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng)) || Math.abs(Number(lat)) > 90 || Math.abs(Number(lng)) > 180) {
          return json({ error: 'Provide valid coordinates for the starting location.' }, 400);
        }
        origin = { lat: Number(lat), lng: Number(lng) };
      }
      // Includes session refresh as well as the backend's current-role/record lookup.
      const result = await step(() => read(internshipId, origin), lookupMs);
      if (result?.error) {
        const status = validStatus(result.status) ? result.status : 503;
        return json({ error: status === 504 ? timeout().message : result.error,
          stage, code: status === 504 ? 'MAP_ROUTE_LOOKUP_TIMEOUT' : 'MAP_ROUTE_LOOKUP_FAILED' }, status);
      }
      if (!result || typeof result !== 'object') {
        return json({ error: 'The application server returned an invalid route response. Refresh and try again.', stage, code: 'MAP_ROUTE_RESPONSE_INVALID' }, 503);
      }
      // Run the public provider server-side only when explicitly requested and after
      // a fresh authorized descriptor lookup. Custom-provider results pass through.
      if (search.get('server_route') === '1' && result.client_route === true) {
        stage = 'provider';
        return json(await step(() => route(result, { cache: !origin }), providerMs));
      }
      return json(result);
    }
    try {
      if (request.signal?.aborted) relayCancel();
      return await Promise.race([work(), aborted]);
    } catch (error) {
      const status = validStatus(error?.status) ? error.status : 503;
      const code = providerCodes.has(error?.code) || ['MAP_ROUTE_LOOKUP_TIMEOUT', 'MAP_ROUTE_CANCELLED'].includes(error?.code)
        ? error.code : stage === 'provider' ? 'ROUTING_UNAVAILABLE' : 'MAP_ROUTE_LOOKUP_FAILED';
      const message = validStatus(error?.status) ? error.message : stage === 'provider'
        ? 'Could not connect to the routing service. Try again or use Google Maps.'
        : 'Could not load the company route from the application server. Try again.';
      return json({ error: message, stage, code }, status);
    } finally {
      clearTimeout(totalTimer);
      request.signal?.removeEventListener('abort', relayCancel);
      controller.signal.removeEventListener('abort', fail);
    }
  };
}
