import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as mapFilters from '../components/map-ui/mapFilters.mjs';
import { groupSitesByCity } from '../components/map-ui/mapVisitPlanning.mjs';

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
const intern = (id, name, course, short) => ({ internship_id: id, student_id: 'student-' + id, name, course, course_short_name: short });
const companies = [
  { company_name: 'Acme', city_name: 'Lucena City', province_name: 'Quezon', lat: 13.94, lon: 121.61, region_id: 4,
    interns: [intern('a', 'Ana Reyes', 'Computer Science', 'BSCS'), intern('b', 'Ben Cruz', 'Education', 'BSED')] },
  { company_name: 'Beta', city_name: 'Taguig City', province_name: 'Metro Manila', lat: 14.55, lon: 121.05, region_id: 15,
    interns: [intern('c', 'Carla Reyes', 'Computer Science', 'BSCS')] },
];
function fixture() {
  const states = []; let cursor = 0;
  const data = { companies, availableRegions: [{ id: 4, name: 'CALABARZON' }, { id: 15, name: 'NCR' }] };
  const useView = load('useMapLocationsView.js', {
    react: { useMemo: fn => fn(), useState(initial) { const index = cursor++; if (!(index in states)) states[index] = initial; return [states[index], value => { states[index] = value; }]; } },
    '@tanstack/react-query': { useQuery: options => options.route ? { refetch() {} } : { data, isError: false }, useQueryClient: () => ({ fetchQuery: async () => ({}) }) },
    '@/contexts/UserContext': { useUser: () => ({ user: { id: 'admin' } }) },
    '@/lib/cache/map-locations-queries': { mapLocationsOptions: () => ({}), mapCompanyRouteOptions: () => ({ route: true }) },
    './mapFilters.mjs': mapFilters,
    './useMapViewerLocation': () => ({ position: null, routePosition: null }),
    './mapSiteFormatting': { getInitials: name => name.slice(0, 2), formatPeriod: () => '' },
    './mapVisitPlanning.mjs': { DEFAULT_MAP_ORIGIN: { lat: 13.931, lng: 121.423 } },
  });
  return () => { cursor = 0; return useView(); };
}
const ids = view => Array.from(view.sites.flatMap(site => site.interns.map(i => i.id)));

test('original student, company, course and course-code searches are case-insensitive and trim whitespace', () => {
  const render = fixture(); let view = render();
  const snapshot = JSON.stringify(companies);
  for (const [query, expected] of [['  aNA  ', ['a']], ['REYES', ['a', 'c']], ['ACME', ['a', 'b']], ['computer science', ['a', 'c']], ['bSeD', ['b']], ['Lucena City', []], ['missing', []], ['', ['a', 'b', 'c']]]) {
    view.setQuery(query); view = render(); assert.deepEqual(ids(view), expected, query);
  }
  assert.equal(JSON.stringify(companies), snapshot);
});

test('region and search combine, All Locations resets only region, and clearing search restores regional students', () => {
  const render = fixture(); let view = render();
  view.setRegionId(4); view.setQuery('Reyes'); view = render(); assert.deepEqual(ids(view), ['a']);
  view.setRegionId(15); view = render(); assert.deepEqual(ids(view), ['c']);
  view.setRegionId(null); view = render(); assert.equal(view.query, 'Reyes'); assert.deepEqual(ids(view), ['a', 'c']);
  view.setRegionId(4); view.setQuery(''); view = render(); assert.deepEqual(ids(view), ['a', 'b']);
  assert.equal(view.regions.length, 2);
});

test('combined map/cities, Companies and route selection retain the same search and region state', () => {
  const render = fixture(); let view = render();
  view.setRegionId(4); view.setQuery('computer');
  assert.deepEqual(Array.from(view.tabs), ['Map View', 'Companies']);
  for (const tab of ['Companies', 'Map View']) {
    view.setTab(tab); view = render(); assert.equal(view.tab, tab); assert.equal(view.query, 'computer'); assert.equal(view.regionId, 4);
    assert.deepEqual(ids(view), ['a']);
    const groups = groupSitesByCity(view.sites); assert.equal(groups.length, 1); assert.equal(groups[0].studentCount, 1);
  }
  view.showRoute(view.sites[0]); view = render(); assert.equal(view.tab, 'Map View'); assert.equal(view.query, 'computer'); assert.equal(view.regionId, 4); assert.equal(view.routeActive, true);
  view.setRegionId(15); view = render(); assert.equal(view.selected, null); assert.equal(view.routeActive, false); assert.deepEqual(ids(view), ['c']);
});

test('region dropdown preserves numeric IDs and the original All Locations reset', () => {
  const props = [];
  const Dropdown = load('MapDropdownFilter.js', { '../ui/DropdownFilter': value => { props.push(value); return null; } });
  const values = [];
  const element = Dropdown({ regions: [{ id: 4, name: 'CALABARZON' }], regionId: 4, onChange: value => values.push(value) });
  element.type(element.props);
  assert.equal(props[0].value, '4'); assert.equal(props[0].options[0].label, 'All Locations');
  props[0].onValueChange('15'); props[0].onValueChange(''); assert.deepEqual(values, [15, null]);
});
