import test from 'node:test';
import assert from 'node:assert/strict';
import { requestMapRoute } from '../components/map-ui/requestMapRoute.mjs';
const descriptor = { client_route: true, origin: { lat: 13.931, lng: 121.423 }, destination: { lat: 14.5995, lng: 120.9842 }, google_maps_url: 'https://www.google.com/maps/dir/' };
const route = { geometry: { type: 'LineString', coordinates: [[121.423, 13.931], [120.9842, 14.5995]] }, distance: 109000, duration: 5640 };
const response = data => ({ ok: true, json: async () => data });

test('verified public routes calculate in the browser using coordinates with no account credentials', async () => {
  const result = await requestMapRoute(async id => { assert.equal(id, 'record'); return descriptor; }, 'record', null, 100, async (url, options) => {
    assert.match(url.pathname, /121.423,13.931;120.9842,14.5995$/); assert.equal(url.searchParams.get('geometries'), 'geojson');
    assert.equal(options.credentials, 'omit'); assert.equal(options.mode, 'cors'); assert.equal(options.headers.Authorization, undefined); assert(options.signal);
    return response({ code: 'Ok', routes: [route] });
  }, 0);
  assert.equal(result.distance_meters, 109000); assert.deepEqual(result.geometry, route.geometry);
});

test('existing server routes stay supported and authorization failures never contact the public provider', async () => {
  let calls = 0; const fetcher = () => { calls++; throw Error('unexpected'); };
  const saved = { geometry: route.geometry, distance_meters: route.distance, duration_seconds: route.duration };
  assert.equal(await requestMapRoute(async () => saved, 'record', null, 100, fetcher, 0), saved);
  await assert.rejects(requestMapRoute(async () => ({ error: 'Access denied.', status: 403 }), 'record', null, 100, fetcher, 0), error => error.status === 403);
  assert.equal(calls, 0);
});

test('disconnected routes, malformed geometry and browser connection failures become explicit errors', async () => {
  await assert.rejects(requestMapRoute(async () => descriptor, 'record', null, 100, async () => response({ code: 'NoRoute' }), 0), error => error.status === 422);
  await assert.rejects(requestMapRoute(async () => descriptor, 'record', null, 100, async () => response({ code: 'Ok', routes: [{ ...route, geometry: { type: 'LineString', coordinates: [[null, 13], [121, 14]] } }] }), 0));
  await assert.rejects(requestMapRoute(async () => descriptor, 'record', null, 100, async () => { throw Error('private network detail'); }, 0), error => /browser could not connect/.test(error.message) && !error.message.includes('private'));
});

test('stalled server actions time out and a late descriptor cannot start an abandoned public route', async () => {
  let finish, calls = 0;
  const pending = requestMapRoute(() => new Promise(resolve => { finish = resolve; }), 'record', null, 5, async () => { calls++; return response({ code: 'Ok', routes: [route] }); }, 0);
  await assert.rejects(pending, error => error.status === 504);
  finish(descriptor); await Promise.resolve(); await Promise.resolve(); assert.equal(calls, 0);
});

test('a stalled public fetch is aborted rather than leaving routing in a loading state', async () => {
  let signal;
  await assert.rejects(requestMapRoute(async () => descriptor, 'record', null, 5, async (url, options) => {
    signal = options.signal; return new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
  }, 0), error => error.status === 504);
  assert.equal(signal.aborted, true);
});


test('browser provider failures use the authenticated server fallback, with no fallback for authorization or disconnected routes', async () => {
  const fallbackCalls = [];
  const saved = { geometry: route.geometry, distance_meters: route.distance, duration_seconds: route.duration };
  const fallback = async (...args) => { fallbackCalls.push(args); return saved; };
  assert.equal(await requestMapRoute(async () => descriptor, 'record', null, 100,
    async () => { throw Error('browser connection blocked'); }, 0, fallback), saved);
  assert.equal(fallbackCalls.length, 1); assert.equal(fallbackCalls[0][0], 'record'); assert(fallbackCalls[0][2].signal);
  await assert.rejects(requestMapRoute(async () => ({ error: 'Access denied.', status: 403 }), 'record', null, 100,
    async () => response({ code: 'Ok', routes: [route] }), 0, fallback), error => error.status === 403);
  await assert.rejects(requestMapRoute(async () => descriptor, 'record', null, 100,
    async () => response({ code: 'NoRoute' }), 0, fallback), error => error.status === 422);
  assert.equal(fallbackCalls.length, 1);
});

test('a timed-out browser route is aborted before the server fallback returns real geometry', async () => {
  let signal;
  const saved = { geometry: route.geometry, distance_meters: route.distance, duration_seconds: route.duration };
  const result = await requestMapRoute(async () => descriptor, 'record', null, 10,
    async (url, options) => { signal = options.signal; return new Promise(() => {}); }, 0,
    async () => { assert.equal(signal.aborted, true); return saved; });
  assert.equal(result, saved);
});

test('lookup and provider latency receive independent deadlines instead of sharing one expiring budget', async () => {
  const delay = value => new Promise(resolve => setTimeout(() => resolve(value), 300));
  const result = await requestMapRoute(() => delay(descriptor), 'record', null, 500,
    () => delay(response({ code: 'Ok', routes: [route] })), 0);
  assert.equal(result.distance_meters, route.distance);
});


test('a stalled server fallback also terminates with its own explicit timeout', async () => {
  let signal;
  await assert.rejects(requestMapRoute(async () => descriptor, 'record', null, 10,
    async () => { throw Error('browser offline'); }, 0,
    async (id, origin, options) => { signal = options.signal; return new Promise(() => {}); }),
    error => error.status === 504 && /fallback routing request timed out/.test(error.message));
  assert.equal(signal.aborted, true);
});
