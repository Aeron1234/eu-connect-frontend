import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { readMapRoute } from '../components/map-ui/readMapRoute.mjs';
import { createMapRouteHandler } from '../app/api/map/createMapRouteHandler.mjs';
import { createPublicMapRouter } from '../app/api/map/requestPublicRoute.mjs';
import { createRouteProviderRequester } from '../app/api/map/routeProviderRequest.mjs';

const descriptor = { client_route: true, origin: { lat: 13.931, lng: 121.423 }, destination: { lat: 14.5995, lng: 120.9842 } };
const geometry = { type: 'LineString', coordinates: [[121.423, 13.931], [120.9842, 14.5995]] };
const data = { code: 'Ok', routes: [{ geometry, distance: 109000, duration: 5640 }] };

test('route reads use cancellable same-origin GET requests independently of server actions', async () => {
  const controller = new AbortController();
  const result = await readMapRoute('record-id', { lat: 14, lng: 121 }, { signal: controller.signal, serverRoute: true }, async (url, options) => {
    const parsed = new URL(url, 'https://example.vercel.app');
    assert.equal(parsed.pathname, '/api/map/route/record-id');
    assert.equal(parsed.searchParams.get('origin_lat'), '14'); assert.equal(parsed.searchParams.get('origin_lng'), '121');
    assert.equal(parsed.searchParams.get('server_route'), '1');
    assert.equal(options.method, 'GET'); assert.equal(options.credentials, 'same-origin'); assert.equal(options.cache, 'no-store');
    assert.equal(options.headers.Authorization, undefined); assert.equal(options.signal, controller.signal);
    return Response.json(descriptor);
  });
  assert.deepEqual(result, descriptor);
  await assert.rejects(readMapRoute('id', null, {}, async () => Response.json({ error: 'Denied.' }, { status: 403 })), error => error.status === 403);
  await assert.rejects(readMapRoute('id', null, {}, async () => new Response('<html>proxy failure</html>')), /invalid route response/);
});

function handler(read, fallback = async () => { throw Error('unexpected fallback'); }) {
  const require = createRequire(import.meta.url);
  const { transformSync } = require('next/dist/compiled/babel/core');
  const source = new URL('../app/api/map/route/[internshipId]/route.js', import.meta.url);
  const { code } = transformSync(readFileSync(source, 'utf8'), { filename: source.pathname, babelrc: false, configFile: false,
    presets: [[require('next/babel'), { 'preset-env': { modules: 'commonjs' } }]] });
  const mod = { exports: {} };
  vm.runInNewContext(code, { exports: mod.exports, module: mod, URL, Response,
    require(id) {
      if (id === '@/lib/server-actions/map-actions') return { getMapCompanyRouteResult: read };
      if (id === '../../requestPublicRoute.mjs') return { requestPublicRoute: fallback };
      if (id === '../../createMapRouteHandler.mjs') return { createMapRouteHandler };
      return require(id);
    } });
  return (query = '', id = 'record') => mod.exports.GET(new Request('https://example.vercel.app/api/map/route/' + id + query), { params: Promise.resolve({ internshipId: id }) });
}

test('GET routing preserves backend authorization and current-record checks before any public fallback', async () => {
  let lookups = 0, providers = 0;
  const get = handler(async () => { lookups++; return { error: 'Forbidden.', status: 403 }; }, async () => { providers++; });
  const denied = await get('?server_route=1'); assert.equal(denied.status, 403); assert.equal(providers, 0);
  assert.equal(denied.headers.get('cache-control'), 'private, no-store');
  assert.equal((await get('?origin_lat=14')).status, 400);
  assert.equal((await get('?origin_lat=&origin_lng=121')).status, 400);
  assert.equal((await get('', 'invalid!')).status, 400); assert.equal(lookups, 1);
});

test('server fallback uses only verified destinations, preserves live origin, and bypasses its shared cache for live location', async () => {
  let seen;
  const get = handler(async (id, origin) => { assert.equal(id, 'record'); return { ...descriptor, origin }; }, async (value, options) => {
    seen = { value, options }; return { ...value, geometry, distance_meters: 109000, duration_seconds: 5640 };
  });
  const response = await get('?origin_lat=14&origin_lng=121&server_route=1&destination=https://untrusted.example');
  assert.equal(response.status, 200); assert.equal(seen.value.destination, descriptor.destination);
  assert.equal(seen.value.origin.lat, 14); assert.equal(seen.options.cache, false);
  assert.deepEqual((await response.json()).geometry, geometry);
  let contacted = false;
  const privateRoute = { geometry, distance_meters: 100, duration_seconds: 10 };
  const custom = handler(async () => privateRoute, async () => { contacted = true; });
  assert.deepEqual(await (await custom('?server_route=1')).json(), privateRoute); assert.equal(contacted, false);
});

test('public fallback sends coordinates without credentials, validates geometry, and caches campus routes only', async () => {
  let calls = 0;
  const route = createPublicMapRouter({ requester: createRouteProviderRequester({ intervalMs: 0, timeoutMs: 100 }), fetcher: async (url, options) => {
    calls++; assert.equal(url.origin, 'https://routing.openstreetmap.de');
    assert.match(url.pathname, /121.423,13.931;120.9842,14.5995$/);
    assert.equal(options.headers.Authorization, undefined); assert.equal(options.credentials, 'omit'); assert.equal(options.cache, 'no-store');
    return Response.json(data);
  } });
  assert.equal((await route(descriptor)).distance_meters, 109000); await route(descriptor); assert.equal(calls, 1);
  await route(descriptor, { cache: false }); await route(descriptor, { cache: false }); assert.equal(calls, 3);
  const bad = createPublicMapRouter({ requester: async () => ({ ...data, routes: [{ ...data.routes[0], geometry: { type: 'LineString', coordinates: [[null, 13], [120, 14]] } }] }) });
  await assert.rejects(bad(descriptor), /invalid road route/);
});

test('a stalled fallback provider times out and cannot leave the request queue blocked', async () => {
  const request = createRouteProviderRequester({ intervalMs: 0, timeoutMs: 10 });
  const route = createPublicMapRouter({ requester: request, fetcher: async () => new Promise(() => {}) });
  await assert.rejects(route(descriptor), error => error.status === 504);
  const next = await request('route/v1/driving/121,13;120,14', async () => Response.json(data), 'https://routing.openstreetmap.de/routed-car/');
  assert.equal(next.code, 'Ok');
});

test('a stalled lookup returns JSON and a late result cannot start routing', async () => {
  let finish, providers = 0;
  const get = createMapRouteHandler({ read: () => new Promise(resolve => { finish = resolve; }),
    route: async () => { providers++; }, lookupMs: 10, providerMs: 50, totalMs: 100 });
  const response = await get(new Request('https://example.test/api/map/route/record?server_route=1'), { params: Promise.resolve({ internshipId: 'record' }) });
  assert.equal(response.status, 504);
  const body = await response.json();
  assert.equal(body.stage, 'lookup'); assert.equal(body.code, 'MAP_ROUTE_LOOKUP_TIMEOUT');
  finish(descriptor); await Promise.resolve(); await Promise.resolve(); assert.equal(providers, 0);
});

test('a stalled provider returns a distinct JSON timeout even if it ignores abort', async () => {
  const get = createMapRouteHandler({ read: async () => descriptor, route: async () => new Promise(() => {}),
    lookupMs: 50, providerMs: 10, totalMs: 100 });
  const response = await get(new Request('https://example.test/api/map/route/record?server_route=1'), { params: Promise.resolve({ internshipId: 'record' }) });
  assert.equal(response.status, 504);
  const body = await response.json();
  assert.equal(body.stage, 'provider'); assert.equal(body.code, 'ROUTING_TIMEOUT');
});

test('the whole handler has a deadline and cancellation prevents a later provider call', async () => {
  let reads = 0;
  const get = createMapRouteHandler({ read: async () => { reads++; return descriptor; }, route: async () => data,
    lookupMs: 50, providerMs: 50, totalMs: 10 });
  const response = await get(new Request('https://example.test/api/map/route/record'), { params: new Promise(() => {}) });
  assert.equal(response.status, 504); assert.equal(reads, 0);
  let finish, providers = 0;
  const controller = new AbortController();
  const cancel = createMapRouteHandler({ read: () => new Promise(resolve => { finish = resolve; }), route: async () => { providers++; } });
  const pending = cancel(new Request('https://example.test/api/map/route/record?server_route=1', { signal: controller.signal }), { params: Promise.resolve({ internshipId: 'record' }) });
  await Promise.resolve(); controller.abort();
  const cancelled = await pending;
  assert.equal(cancelled.status, 408); assert.equal((await cancelled.json()).code, 'MAP_ROUTE_CANCELLED');
  finish(descriptor); await Promise.resolve(); assert.equal(providers, 0);
});

test('503 responses identify their stage without exposing unexpected exception details', async () => {
  const lookup = handler(async () => ({ error: 'Could not load the company location.', status: 503 }));
  const unavailable = await lookup('?server_route=1'); assert.equal(unavailable.status, 503);
  assert.equal((await unavailable.json()).stage, 'lookup');
  const fallback = handler(async () => descriptor, async () => { throw Object.assign(new Error('Could not connect to the routing service.'), { status: 503, code: 'ROUTING_UNAVAILABLE' }); });
  const provider = await fallback('?server_route=1'); assert.equal(provider.status, 503);
  const body = await provider.json(); assert.equal(body.stage, 'provider'); assert.equal(body.code, 'ROUTING_UNAVAILABLE');
  const unexpected = handler(async () => { throw Error('private connection credentials'); });
  assert.doesNotMatch(JSON.stringify(await (await unexpected()).json()), /credentials/);
  await assert.rejects(readMapRoute('record', null, {}, async () => Response.json(body, { status: 503 })),
    error => error.status === 503 && error.stage === 'provider' && error.code === 'ROUTING_UNAVAILABLE');
});
