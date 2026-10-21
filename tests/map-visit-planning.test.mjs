import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as helpers from '../components/map-ui/mapVisitPlanning.mjs';
const { groupSitesByCity, directionsUrl, DEFAULT_MAP_ORIGIN, routeDistance, routeDuration } = helpers;
const require = createRequire(import.meta.url);
const { transformSync } = require('next/dist/compiled/babel/core');
function load(file, mocks = {}) {
  const url = new URL('../components/map-ui/' + file, import.meta.url);
  const { code } = transformSync(readFileSync(url, 'utf8'), { filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require('next/babel'), { 'preset-env': { modules: 'commonjs' }, 'preset-react': { runtime: 'automatic' } }]] });
  const pass = ({ children }) => children;
  const sharedSelect = { Select: pass, SelectContent: pass, SelectItem: pass, SelectValue: () => null, SelectTrigger: ({ children, ...props }) => React.createElement('button', props, children) };
  mocks = { '@/components/ui/select': sharedSelect, ...mocks };
  const mod = { exports: {} };
  vm.runInNewContext(code, { module: mod, exports: mod.exports, require(id) { return id === './mapVisitPlanning.mjs' ? helpers : Object.hasOwn(mocks, id) ? mocks[id] : require(id); } });
  return mod.exports.default;
}
const intern = (studentId, course = 'BSIT') => ({ id: 'record-' + studentId, studentId, name: 'Student ' + studentId, courseShortName: course });
const site = (id, city, province, interns) => ({ id, company: 'Company ' + id, address: 'Address ' + id, city_name: city, province_name: province, interns, lat: 14, lng: 121 });

test('city groups count unique students across courses and company branches without mutating pins', () => {
  const sites = [site('a', 'Lucena City', 'Quezon', [intern('1'), intern('2', 'BSCS')]), site('b', 'City of Lucena', ' Quezon ', [intern('1')]), site('c', 'San Fernando City', 'Pampanga', [intern('3')]), site('d', 'San Fernando City', 'La Union', [intern('4')])];
  const snapshot = JSON.stringify(sites);
  const groups = groupSitesByCity(sites);
  assert.equal(groups.length, 3);
  assert.equal(groups[0].studentCount, 2);
  assert.equal(groups[0].companyCount, 2);
  assert.deepEqual(groups[0].students.map(i => i.name), ['Student 1', 'Student 2']);
  assert.equal(JSON.stringify(sites), snapshot);
  assert.equal(groupSitesByCity([site('e', 'Dasmariñas City', 'Cavite', [intern('5')]), site('f', 'Dasmarinas', 'Cavite', [intern('6')])]).length, 1);
});

test('missing classification stays explicit and never guesses a city from address or coordinates', () => {
  const groups = groupSitesByCity([site('a', null, null, [intern('1')]), site('b', 'San Fernando', '', [intern('2')])]);
  assert.equal(groups.length, 1); assert.equal(groups[0].id, 'unclassified'); assert.equal(groups[0].studentCount, 2);
  assert.equal(groups[0].name, 'City not classified');
  assert.deepEqual(groupSitesByCity([]), []);
});

test('Google Maps backup uses saved company coordinates and custom campus origin without a routing API', () => {
  const url = new URL(directionsUrl({ lat: 13.94, lng: 121.61 }));
  assert.equal(url.searchParams.get('origin'), '13.9304557,121.4312752');
  assert.equal(new URL(directionsUrl({ lat: 13.94, lng: 121.61 }, { lat: 14, lng: 121.5 })).searchParams.get('origin'), '14,121.5');
  assert.equal(url.searchParams.get('destination'), '13.94,121.61');
  assert.equal(url.searchParams.get('travelmode'), 'driving'); assert.equal(url.searchParams.get('api'), '1');
  assert.equal(directionsUrl(null), null); assert.equal(directionsUrl({ lat: NaN, lng: 121 }), null);
  assert.equal(routeDistance(27488.6), '27.5 km'); assert.equal(routeDuration(1587.6), '27 min'); assert.equal(routeDuration(3660), '1 hr 1 min');
});

test('routing failures retain Google Maps fallback and use accessible inline feedback', () => {
  const View = load('MapDirections.js');
  const html = renderToStaticMarkup(React.createElement(View, { site: site('a', 'Lucena', 'Quezon', []), origin: DEFAULT_MAP_ORIGIN, active: true, query: { isError: true }, onShowRoute() {}, onClearRoute() {} }));
  assert.match(html, /role="status"/); assert.match(html, /could not be loaded/); assert.match(html, /www.google.com/);
  assert.match(html, /Show road route/); assert.match(html, /Clear route/);
});

test('city list shows student names from different courses, sorted by unique students, with both route actions', () => {
  const View = load('CityVisitGroups.js');
  const html = renderToStaticMarkup(React.createElement(View, { sites: [site('b', 'Taguig City', 'Metro Manila', [intern('3')]), site('a', 'Lucena City', 'Quezon', [intern('1'), intern('2', 'BSCS')])], origin: DEFAULT_MAP_ORIGIN, onShowRoute() {} }));
  assert.ok(html.indexOf('Lucena City') < html.indexOf('Taguig City'));
  assert.match(html, /2 students/); assert.match(html, /Student 1/); assert.match(html, /Student 2/); assert.match(html, /BSCS/);
  assert.match(html, /Show road route/); assert.match(html, /Google Maps/); assert.match(html, /all departments/);
});

test('shared map stays unchanged without routing props; road lines convert GeoJSON longitude-first coordinates', () => {
  const lines = [], markers = [], bounds = [];
  const pass = ({ children }) => children;
  const View = load('Map.js', {
    'leaflet/dist/leaflet.css': {},
    leaflet: { divIcon: value => value, latLngBounds: value => value },
    react: { ...React, useEffect: fn => fn() },
    'react-leaflet': { MapContainer: pass, Popup: pass, TileLayer: () => null,
      Marker: props => { markers.push(props); return props.children; },
      Polyline: props => { lines.push(props); return null; }, useMap: () => ({ fitBounds: value => bounds.push(value) }) },
  });
  const sites = [site('a', 'Lucena', 'Quezon', [intern('1')])];
  const render = props => renderToStaticMarkup(React.createElement(View, { sites, ...props }));
  const html = render({}); assert.equal(markers.length, 1); assert.equal(lines.length, 0); assert.match(html, /Student 1/);
  assert.equal(JSON.stringify(bounds[0]), '[[14,121]]');
  markers.length = 0; bounds.length = 0;
  render({ origin: DEFAULT_MAP_ORIGIN, route: { geometry: { coordinates: [[121.423, 13.931], [121.61, 13.94]] } } });
  assert.equal(markers.length, 2); assert.equal(lines.length, 2);
  assert.equal(JSON.stringify(lines[0].positions), '[[13.931,121.423],[13.94,121.61]]');
  assert.equal(JSON.stringify(bounds[0]), JSON.stringify(lines[0].positions));
});

test('recommendations are explicit, explain the ranking and expose a road route action', () => {
  const View = load('MapVisitRecommendations.js');
  const html = renderToStaticMarkup(React.createElement(View, { sites: [site('a', 'Lucena City', 'Quezon', [intern('1'), intern('2')])], origin: DEFAULT_MAP_ORIGIN, onShowRoute() {} }));
  assert.match(html, /Recommended first visits/); assert.match(html, /Recommended first/);
  assert.match(html, /straight-line/); assert.match(html, /Route to Company a/); assert.match(html, /current filters/);
});

test('location controls show the opt-in and return-to-campus actions with accuracy feedback', () => {
  const View = load('MapViewerLocationControls.js');
  const render = location => renderToStaticMarkup(React.createElement(View, { origin: DEFAULT_MAP_ORIGIN, location: { status: 'Ready', ...location } }));
  assert.match(render({ enabled: false }), /Use my location/);
  const active = render({ enabled: true, position: { accuracy: 24.6 } });
  assert.match(active, /Use Candelaria instead/); assert.match(active, /about 25 m/); assert.match(active, /role="status"/);
});
