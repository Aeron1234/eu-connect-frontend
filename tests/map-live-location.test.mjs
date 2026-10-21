import test from 'node:test';
import assert from 'node:assert/strict';
import { startMapLocationSession } from '../components/map-ui/mapLocationSession.mjs';
import { recommendVisitCities, straightLineMeters, DEFAULT_MAP_ORIGIN } from '../components/map-ui/mapVisitPlanning.mjs';

function fixture(connected = true) {
  const listeners = new Map(), scheduled = new Map(), sent = [], positions = [], statuses = []; let nextTimer = 0, success, failure, time = 100000;
  const socket = { connected, on: (event, fn) => listeners.set(event, fn), off: event => listeners.delete(event), connect() {},
    timeout: () => ({ emit(event, payload, callback) { sent.push({ event, payload }); callback(null, { ok: true }); } }), emit: event => sent.push({ event }) };
  const geolocation = { getCurrentPosition(ok, bad, options) { success = ok; failure = bad; assert.equal(options.maximumAge, 0); assert.equal(options.enableHighAccuracy, true); } };
  const stop = startMapLocationSession({ socket, geolocation, sessionId: 'test-session', now: () => time, onPosition: value => positions.push(value), onStatus: value => statuses.push(value), schedule: (fn, delay) => { scheduled.set(++nextTimer, { fn, delay }); return nextTimer; }, cancel: id => scheduled.delete(id) });
  const fix = (lat = 14) => success({ coords: { latitude: lat, longitude: 121, accuracy: 15 }, timestamp: time });
  return { listeners, scheduled, sent, positions, statuses, stop, socket, fix, fail: code => failure({ code }), advance: ms => { time += ms; }, success: () => success };
}

test('fresh device fixes pass through the authenticated WebSocket with a private session identifier', () => {
  const view = fixture(); view.fix();
  assert.equal(view.positions[0].latitude, 14); assert.equal(view.sent[0].event, 'map_location:update');
  assert.equal(view.sent[0].payload.sessionId, 'test-session');
  assert.match(view.statuses.at(-1), /WebSocket/);
  view.listeners.get('map_location:position')({ sessionId: 'other-session', location: { timestamp: 100000 } }); assert.equal(view.positions.length, 1);
  view.listeners.get('map_location:position')({ sessionId: 'test-session', location: { timestamp: 100000, latitude: 14.1 } }); assert.equal(view.positions.at(-1).latitude, 14.1);
  view.stop();
});

test('stopping tracking removes listeners and timers and ignores in-flight GPS callbacks', () => {
  const view = fixture(); const oldSuccess = view.success(); view.fix(); view.stop();
  assert.equal(view.listeners.size, 0); assert.equal(view.scheduled.size, 0); assert.equal(view.sent.at(-1).event, 'map_location:stop');
  const count = view.positions.length; oldSuccess({ coords: { latitude: 15, longitude: 121, accuracy: 10 }, timestamp: 100000 }); assert.equal(view.positions.length, count);
});

test('device location remains usable during a WebSocket outage and expired positions are removed', () => {
  const view = fixture(false); view.fix(); assert.equal(view.sent.length, 0); assert.equal(view.positions[0].latitude, 14);
  assert.match(view.statuses.at(-1), /reconnecting/);
  [...view.scheduled.values()].find(timer => timer.delay === 45000).fn(); assert.equal(view.positions.at(-1), null);
  view.stop();
});

test('denied permission stops polling without publishing a location', () => {
  const view = fixture(); view.fail(1); assert.equal(view.sent.length, 0); assert.equal(view.scheduled.size, 0); assert.match(view.statuses.at(-1), /denied/); view.stop();
});

const site = (id, city, lat, students) => ({ id, city_name: city, province_name: 'Quezon', lat, lng: 121.423, company: id, interns: students.map(studentId => ({ studentId, id: 'record-' + studentId })) });
test('recommendations prioritize unique student coverage, use proximity for ties, and respect filtered input', () => {
  const sites = [site('far', 'Far City', 15, ['1', '2', '3']), site('near', 'Near City', 13.94, ['4', '5']), site('duplicate', 'Near City', 13.95, ['4']), site('other', 'Other City', 14.5, ['6', '7'])];
  const snapshot = JSON.stringify(sites); const result = recommendVisitCities(sites, DEFAULT_MAP_ORIGIN);
  assert.deepEqual(result.map(group => group.name), ['Far City', 'Near City', 'Other City']);
  assert.equal(result[1].studentCount, 2); assert.equal(result[1].firstSite.id, 'near');
  assert.equal(recommendVisitCities(sites.filter(value => value.id === 'other'), DEFAULT_MAP_ORIGIN)[0].name, 'Other City');
  assert.equal(JSON.stringify(sites), snapshot);
  assert.equal(recommendVisitCities([{ ...sites[0], city_name: null }], DEFAULT_MAP_ORIGIN).length, 0);
});

test('proximity updates from the selected starting point without claiming road distance', () => {
  assert.equal(straightLineMeters(DEFAULT_MAP_ORIGIN, DEFAULT_MAP_ORIGIN), 0);
  const sites = [site('south', 'South City', 13, ['1']), site('north', 'North City', 15, ['2'])];
  assert.equal(recommendVisitCities(sites, { lat: 13, lng: 121.423 })[0].name, 'South City');
  assert.equal(recommendVisitCities(sites, { lat: 15, lng: 121.423 })[0].name, 'North City');
});
