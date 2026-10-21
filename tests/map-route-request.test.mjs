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
