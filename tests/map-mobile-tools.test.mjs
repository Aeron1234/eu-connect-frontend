import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const { transformSync } = require('next/dist/compiled/babel/core');
function fixture() {
  const values = [], dialogs = new Map(), routes = [], changes = new Map(); let cursor = 0, mounted = false;
  const media = { matches: false, addEventListener: (event, fn) => changes.set(event, fn), removeEventListener: event => changes.delete(event) };
  const location = { enabled: true, status: 'Live location updated over WebSocket.', start() {}, stop() {} };
  const sites = [{ id: 'filtered-company' }], origin = { lat: 14, lng: 121, label: 'Your current location' };
  const url = new URL('../components/map-ui/MapPlanningTools.js', import.meta.url);
  const { code } = transformSync(readFileSync(url, 'utf8'), { filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require('next/babel'), { 'preset-env': { modules: 'commonjs' }, 'preset-react': { runtime: 'automatic' } }]] });
  const mocks = {
    react: { ...React, useState(initial) { const index = cursor++; if (!(index in values)) values[index] = initial; return [values[index], next => { values[index] = next; }]; }, useEffect(fn) { if (!mounted) { mounted = true; fn(); } } },
    '../ui/Modal': props => { dialogs.set(props.title, props); return React.createElement(React.Fragment, null, React.createElement('button', { type: 'button' }, props.trigger), props.open ? props.children : null); },
    './MapViewerLocationControls': ({ location: current }) => React.createElement('div', { 'data-location-details': true }, current.status),
    './MapVisitRecommendations': () => React.createElement('div', { 'data-recommendations-details': true }, 'Full recommendations'),
  };
  const mod = { exports: {} };
  vm.runInNewContext(code, { module: mod, exports: mod.exports, window: { matchMedia: () => media }, require(id) { return Object.hasOwn(mocks, id) ? mocks[id] : require(id); } });
  return { dialogs, routes, sites, origin, location, media, changes, render() { cursor = 0; return renderToStaticMarkup(React.createElement(mod.exports.default, { sites, origin, viewerLocation: location, onShowRoute: site => routes.push(site) })); } };
}

test('mobile map tools begin collapsed while desktop retains the expanded panels', () => {
  const view = fixture(); const html = view.render();
  const mobile = html.slice(html.indexOf('aria-label="Map tools"'), html.indexOf('class="hidden space-y-6 lg:block"'));
  assert.match(mobile, /Location/); assert.match(mobile, /Recommendations/); assert.match(mobile, /Starting point: Your current location/);
  assert.doesNotMatch(mobile, /Full recommendations|data-location-details/);
  assert.equal(view.dialogs.get('Route starting point').open, false); assert.equal(view.dialogs.get('Visit recommendations').open, false);
  assert.match(html.slice(html.indexOf('class="hidden space-y-6 lg:block"')), /Full recommendations/);
});

test('recommended routing closes the mobile dialog and retains the filtered site and live location', () => {
  const view = fixture(); view.render();
  view.dialogs.get('Visit recommendations').onOpenChange(true); view.render();
  const dialog = view.dialogs.get('Visit recommendations'); assert.equal(dialog.open, true);
  assert.equal(dialog.children.props.sites, view.sites); assert.equal(dialog.children.props.origin, view.origin);
  dialog.children.props.onShowRoute(view.sites[0]); view.render();
  assert.equal(view.dialogs.get('Visit recommendations').open, false); assert.deepEqual(view.routes, [view.sites[0]]); assert.equal(view.location.enabled, true);
  view.dialogs.get('Route starting point').onOpenChange(true); view.render();
  assert.equal(view.dialogs.get('Route starting point').children.props.location, view.location);
});

test('resizing to desktop closes mobile dialogs instead of leaving an overlay over the map', () => {
  const view = fixture(); view.render(); view.dialogs.get('Route starting point').onOpenChange(true); view.render();
  assert.equal(view.dialogs.get('Route starting point').open, true);
  view.media.matches = true; view.changes.get('change')(); view.render();
  assert.equal(view.dialogs.get('Route starting point').open, false);
});
