import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const { transformSync } = require('next/dist/compiled/babel/core');
function load(file, mocks) {
  const url = new URL('../components/map-ui/' + file, import.meta.url);
  const { code } = transformSync(readFileSync(url, 'utf8'), { filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require('next/babel'), { 'preset-env': { modules: 'commonjs' }, 'preset-react': { runtime: 'automatic' } }]] });
  const mod = { exports: {} };
  vm.runInNewContext(code, { module: mod, exports: mod.exports, require(id) { return Object.hasOwn(mocks, id) ? mocks[id] : require(id); } });
  return mod.exports.default;
}
function fixture() {
  let dismissed = null, selected = null, map, slideout, directions, cities;
  const routes = [];
  const pending = [], refs = []; let refCursor = 0;
  const sites = [{ id: 'a', company: 'Acme' }, { id: 'b', company: 'Beta' }];
  const View = load('CompanyMapView.js', {
    react: { ...React, useState: () => [dismissed, value => { dismissed = value; }], useRef: initial => { const index = refCursor++; return refs[index] ||= { current: initial }; } },
    'next/dynamic': () => props => { map = props; return React.createElement('div', null, 'Map'); },
    '@/components/ui/skeleton': { Skeleton: () => null },
    './MapCompanySlideout': props => { slideout = props; return props.open ? React.createElement('section', { 'data-map-slideout': true }, props.children) : null; },
    './SelectedCompanyPanel': props => React.createElement('aside', { 'data-embedded': String(Boolean(props.embedded)) }, props.selected?.company || 'No company', props.routeControls),
    './MapDirections': props => { directions = props; return React.createElement('span', null, props.query?.isError ? props.query.error.message : 'Route controls'); },
    './CityVisitGroups': props => { cities = props; return React.createElement('section', null, 'City list'); },
  });
  return { sites, routes, finish: success => pending.shift()({ success }), map: () => map, cities: () => cities, slideout: () => slideout, directions: () => directions, selected: () => selected,
    render() { refCursor = 0; return renderToStaticMarkup(React.createElement(View, { sites, selectedId: selected?.id, selected, setSelectedId: id => { selected = sites.find(site => site.id === id); }, origin: { label: 'Candelaria' }, showRoute: site => { selected = site; routes.push(site); return new Promise(resolve => pending.push(resolve)); }, clearRoute() {}, routeActive: routes.length > 0, routeQuery: { isFetching: pending.length > 0, isError: routes.length > 0 && pending.length === 0, error: new Error('Routing service timed out.') } })); } };
}

test('city routes share the map sites and close the in-map panel only after success', async () => {
  const view = fixture(); const html = view.render();
  assert.match(html, /Map/); assert.match(html, /City list/); assert.equal(view.cities().sites, view.sites);
  const request = view.cities().onShowRoute(view.sites[1]); view.render();
  assert.equal(view.selected().id, 'b'); assert.equal(view.slideout().open, true);
  view.finish(true); await request; view.render(); assert.equal(view.slideout().open, false);
  assert.deepEqual(view.routes, [view.sites[1]]); assert.doesNotMatch(view.render(), /Road route status/);
  view.map().onSelect('b'); view.render(); assert.equal(view.slideout().open, true);
});

test('mobile pin selection opens the panel, dismissal keeps selection, and the same pin can reopen it', () => {
  const view = fixture(); view.render(); assert.equal(view.slideout().open, false); assert.equal(view.map().showCompanyPopups, false);
  view.map().onSelect('a'); let html = view.render(); assert.equal(view.slideout().open, true); assert.match(html, /data-map-slideout="true"/);
  assert.equal(view.slideout().children.props.embedded, true);
  view.slideout().onClose(); html = view.render(); assert.equal(view.slideout().open, false); assert.equal(view.selected().id, 'a'); assert.match(html, /Open company details: Acme/);
  view.map().onSelect('a'); view.render(); assert.equal(view.slideout().open, true);
  view.map().onSelect('b'); view.render(); assert.equal(view.slideout().children.props.selected.company, 'Beta');
});

test('mobile route loading and failures keep the panel open; success closes it', async () => {
  const view = fixture(); view.render(); view.map().onSelect('a'); view.render();
  const failed = view.directions().onShowRoute(); view.render(); assert.equal(view.slideout().open, true);
  view.finish(false); await failed; assert.match(view.render(), /Routing service timed out/); assert.equal(view.slideout().open, true);
  const retry = view.directions().onShowRoute(); view.render(); assert.equal(view.slideout().open, true);
  view.finish(true); await retry; view.render(); assert.equal(view.slideout().open, false); assert.equal(view.selected().id, 'a');
});

test('one nonmodal map panel is used at every viewport size without duplicate details', () => {
  const view = fixture(); view.render(); view.map().onSelect('a'); const html = view.render();
  assert.equal(view.slideout().open, true);
  assert.equal((html.match(/data-map-slideout="true"/g) || []).length, 1);
  assert.doesNotMatch(html, /data-drawer|aria-haspopup="dialog"/);
  assert.equal(view.map().showCompanyPopups, false);
  assert.match(html, /City list/);
});

test('desktop details stay open through loading and failure, then close on successful retry', async () => {
  const view = fixture(); view.render(); assert.equal(view.slideout().open, false);
  view.map().onSelect('a'); view.render(); assert.equal(view.slideout().open, true);
  view.slideout().onClose(); view.render(); assert.equal(view.slideout().open, false); assert.equal(view.selected().id, 'a');
  view.map().onSelect('a'); view.render(); assert.equal(view.slideout().open, true);
  const failed = view.directions().onShowRoute(); view.render(); assert.equal(view.slideout().open, true);
  view.finish(false); await failed; assert.match(view.render(), /Routing service timed out/); assert.equal(view.slideout().open, true);
  const retry = view.directions().onShowRoute(); view.render(); assert.equal(view.slideout().open, true);
  view.finish(true); await retry; const html = view.render(); assert.equal(view.slideout().open, false);
  assert.doesNotMatch(html, /Road route status|Route controls/); assert.match(html, /Open company details/); assert.match(html, /City list/);
  view.map().onSelect('b'); view.render(); assert.equal(view.slideout().children.props.selected.id, 'b');
});

test('an older successful route cannot close a different company panel', async () => {
  const view = fixture(); view.render(); view.map().onSelect('a'); view.render();
  const pending = view.directions().onShowRoute();
  view.map().onSelect('b'); view.render(); view.finish(true); await pending; view.render();
  assert.equal(view.slideout().open, true); assert.equal(view.selected().id, 'b');
});

test('map slideout stays local and nonmodal, hides inactive content from keyboard focus, and closes with Escape', () => {
  let closed = 0, focused = 0;
  const View = load('MapCompanySlideout.js', { react: { ...React, useEffect() {}, useRef: () => ({ current: null }) } });
  const props = { onClose: () => { closed++; }, returnFocusRef: { current: { focus: () => { focused++; } } }, children: 'Student details' };
  const hidden = View({ ...props, open: false }); assert.equal(hidden.props.inert, true); assert.equal(hidden.props['aria-hidden'], true);
  const open = View({ ...props, open: true }); assert.equal(open.props.inert, false); assert.equal(open.props['aria-modal'], undefined);
  assert.match(open.props.className, /absolute inset-y-0 left-0/);
  assert.doesNotMatch(open.props.className, /max-h-|inset-y-2/);
  assert.match(open.props.className, /max-w-\[17rem\]/);
  assert.doesNotMatch(open.props.className, /(?:^| )hidden(?: |$)|fixed/);
  assert.match(renderToStaticMarkup(open), /overflow-y-auto/);
  open.props.onKeyDown({ key: 'Escape', stopPropagation() {} }); assert.equal(closed, 1); assert.equal(focused, 1);
});

