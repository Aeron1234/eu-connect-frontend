export async function readMapRoute(internshipId, origin, { signal, serverRoute = false } = {}, fetcher = fetch) {
  const params = new URLSearchParams();
  if (origin) {
    params.set('origin_lat', String(origin.lat));
    params.set('origin_lng', String(origin.lng));
  }
  if (serverRoute) params.set('server_route', '1');
  const query = params.size ? '?' + params : '';
  let response;
  try {
    response = await fetcher('/api/map/route/' + encodeURIComponent(internshipId) + query, {
      method: 'GET', credentials: 'same-origin', cache: 'no-store', signal,
      headers: { Accept: 'application/json' },
    });
  } catch {
    if (signal?.aborted) throw signal.reason;
    throw Object.assign(new Error('Could not reach the application server for routing. Try again.'), { status: 503 });
  }
  let result;
  try { result = await response.json(); }
  catch {
    throw Object.assign(new Error('The application server returned an invalid route response. Refresh and try again.'), { status: response.ok ? 503 : response.status });
  }
  if (!response.ok) {
    throw Object.assign(new Error(result?.error || 'Could not load the company route. Try again or use Google Maps.'), { status: response.status, code: result?.code, stage: result?.stage });
  }
  return result;
}
