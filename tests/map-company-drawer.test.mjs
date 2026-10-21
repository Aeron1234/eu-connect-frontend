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
function fixture(mobile = true) {
  let small = mobile, dismissed = null, selected = null, map, drawer, directions;
  const routes = [];
  const sites = [{ id: 'a', company: 'Acme' }, { id: 'b', company: 'Beta' }];
  const View = load('CompanyMapView.js', {
    react: { ...React, useState: () => [dismissed, value => { dismissed = value; }], useRef: () => ({ current: null }) },
    'next/dynamic': () => props => { map = props; return React.createElement('div', null, 'Map'); },
    '@/components/ui/skeleton': { Skeleton: () => null },
    './useSmallMapViewport': () => small,
    './SelectedCompanyDrawer': props => { drawer = props; return props.open ? React.createElement('section', { 'data-drawer': true }, props.children) : null; },
    './SelectedCompanyPanel': props => React.createElement('aside', { 'data-embedded': String(Boolean(props.embedded)) }, props.selected?.company || 'No company', props.routeControls),
    './MapDirections': props => { directions = props; return React.createElement('span', null, props.query?.isError ? props.query.error.message : 'Route controls'); },
  });
  return { sites, routes, map: () => map, drawer: () => drawer, directions: () => directions, resize: value => { small = value; }, selected: () => selected,
    render() { return renderToStaticMarkup(React.createElement(View, { sites, selectedId: selected?.id, selected, setSelectedId: id => { selected = sites.find(site => site.id === id); }, origin: { label: 'Candelaria' }, showRoute: site => routes.push(site), clearRoute() {}, routeActive: routes.length > 0, routeQuery: { isError: routes.length > 0, error: new Error('Routing service timed out.') } })); } };
}

test('mobile pin selection opens the drawer, dismissal keeps selection, and the same pin can reopen it', () => {
  const view = fixture(); view.render(); assert.equal(view.drawer().open, false); assert.equal(view.map().showCompanyPopups, false);
  view.map().onSelect('a'); let html = view.render(); assert.equal(view.drawer().open, true); assert.match(html, /data-drawer="true"/);
  assert.equal(view.drawer().children.props.embedded, true);
  view.drawer().onOpenChange(false); html = view.render(); assert.equal(view.drawer().open, false); assert.equal(view.selected().id, 'a'); assert.match(html, /Acme · Details/);
  view.map().onSelect('a'); view.render(); assert.equal(view.drawer().open, true);
  view.map().onSelect('b'); view.render(); assert.equal(view.drawer().children.props.selected.company, 'Beta');
});

test('showing a mobile route closes the drawer without clearing the selected company', () => {
  const view = fixture(); view.render(); view.map().onSelect('a'); view.render();
  view.directions().onShowRoute(); view.render(); assert.equal(view.drawer().open, false); assert.equal(view.selected().id, 'a'); assert.deepEqual(view.routes, [view.sites[0]]);
  assert.match(view.render(), /Road route status/); assert.match(view.render(), /Routing service timed out/);
});

test('desktop retains its panel and company popups; resizing closes the mobile drawer', () => {
  const view = fixture(); view.render(); view.map().onSelect('a'); view.render(); assert.equal(view.drawer().open, true);
  view.resize(false); const html = view.render(); assert.equal(view.drawer().open, false); assert.equal(view.map().showCompanyPopups, true); assert.match(html, /hidden lg:block/);
  view.directions().onShowRoute(); view.render(); assert.equal(view.selected().id, 'a'); assert.deepEqual(view.routes, [view.sites[0]]);
});

test('drawer uses dialog semantics, a left-edge animation and a scrollable body', () => {
  const props = {}; const wrap = tag => function DialogMock(value) { props[tag] = value; return React.createElement('div', { className: value.className }, value.children); };
  const View = load('SelectedCompanyDrawer.js', { 'radix-ui': { Dialog: { Root: wrap('root'), Portal: wrap('portal'), Overlay: wrap('overlay'), Content: wrap('content'), Title: wrap('title'), Close: wrap('close') } } });
  const html = renderToStaticMarkup(React.createElement(View, { open: true, onOpenChange() {}, returnFocusRef: { current: null } }, 'Student details'));
  assert.equal(props.root.open, true); assert.match(props.content.className, /slide-in-from-left/); assert.match(props.content.className, /slide-out-to-left/);
  assert.match(props.content.className, /motion-reduce:animate-none/); assert.match(html, /overflow-y-auto/); assert.match(html, /Close company details/);
  assert.equal(props.title.children, 'Company details');
});
