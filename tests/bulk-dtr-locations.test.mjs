import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as ReactQuery from '@tanstack/react-query';
import { selectDtrPage, remainingDtrSelection, validDtrDraft } from '../lib/bulk-dtr-selection.mjs';
import { getNotificationTargetPath } from '../lib/notification-routes.js';

const require = createRequire(import.meta.url);
const { transformSync } = require('next/dist/compiled/babel/core');
function load(file, mocks) {
  const source = new URL('../' + file, import.meta.url);
  const { code } = transformSync(readFileSync(source, 'utf8'), { filename: source.pathname, babelrc: false, configFile: false, presets: [[require('next/babel'), { 'preset-env': { modules: 'commonjs' }, 'preset-react': { runtime: 'automatic' } }]] });
  const compiled = { exports: {} };
  vm.runInNewContext(code, { module: compiled, exports: compiled.exports, setTimeout, clearTimeout, require(id) { return Object.hasOwn(mocks, id) ? mocks[id] : require(id); } });
  return compiled.exports;
}
const row = (id, name = id) => ({ internship_id: id, user_id: id, name, avatar: null, company_name: 'Hospital', course_code: 'BSN', department_code: 'CN', location: null, company_location: null });
test('page selection preserves other pages/filters and retains only failed results', () => {
  const first = selectDtrPage(new Map(), [row('one'), row('two')], true);
  const bothPages = selectDtrPage(first, [row('three')], true);
  assert.deepEqual([...bothPages.keys()], ['one', 'two', 'three']);
  const uncheckPage = selectDtrPage(bothPages, [row('one'), row('two')], false);
  assert.deepEqual([...uncheckPage.keys()], ['three']);
  assert.deepEqual([...remainingDtrSelection(bothPages, [{ internship_id: 'one', status: 'assigned' }, { internship_id: 'two', status: 'unchanged' }, { internship_id: 'three', status: 'failed' }]).keys()], ['three']);
  assert.equal(selectDtrPage(new Map(), Array.from({ length: 101 }, (_, n) => row(String(n))), true), null);
  assert.equal(validDtrDraft({ lat: '', lon: '' }, 150), false);
  assert.equal(validDtrDraft({ lat: 0, lon: 0 }, 150), true);
  assert.equal(validDtrDraft({ lat: 13, lon: 121 }, 19), false);
});
test('new DTR alerts resolve fixed destinations while legacy/untrusted links stay in the inbox', () => {
  for (const link of ['/student', '/dtr-locations']) assert.equal(getNotificationTargetPath({ type: 'dtr_location_set', link }), link);
  for (const link of [undefined, 'https://attacker.test', '/admin']) assert.equal(getNotificationTargetPath({ type: 'dtr_location_set', link }), '/notifications');
});

test('rendered page keeps hidden selections, scopes select-all, reviews one location and retains partial failures', async () => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'http://localhost' });
  const previous = { window: globalThis.window, document: globalThis.document, navigator: Object.getOwnPropertyDescriptor(globalThis, 'navigator'), act: globalThis.IS_REACT_ACT_ENVIRONMENT };
  globalThis.window = dom.window; globalThis.document = dom.window.document;
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const { createRoot } = await import('react-dom/client');
  const root = createRoot(document.getElementById('root'));
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  let result, calls = [], reads = [];
  const listeners = new Map();
  const StudentAvatar = () => null;
  const Empty = () => null;
  const Button = ({ children, variant, size, ...props }) => React.createElement('button', props, children);
  const Checkbox = ({ checked, onCheckedChange, ...props }) => React.createElement('input', { ...props, type: 'checkbox', checked: checked === true, onChange: e => onCheckedChange(e.target.checked) });
  // Use native select in this harness, keeping real component filter state/events.
  const SelectContext = React.createContext({});
  const Select = ({ value, onValueChange, children, disabled }) => React.createElement(SelectContext.Provider, { value: { value, onValueChange, disabled } }, children);
  const SelectTrigger = ({ 'aria-label': label }) => { const current = React.useContext(SelectContext); return React.createElement('select', { 'aria-label': label, value: current.value, disabled: current.disabled, onChange: e => current.onValueChange(e.target.value) }, ['all', '1', '2'].map(id => React.createElement('option', { key: id, value: id }, id))); };
  const Confirmation = ({ open, description, onConfirm, pending }) => open ? React.createElement('div', { role: 'dialog' }, description, React.createElement('button', { onClick: onConfirm, disabled: pending }, 'Confirm save')) : null;
  const MapStub = ({ setDraft }) => React.createElement('button', { onClick: () => setDraft({ lat: 13.93, lon: 121.43, address: 'Hospital entrance', label: '' }) }, 'Choose location');
  const api = {
    async getBulkDtrStudents(filters) {
      reads.push(filters);
      const students = filters.departmentId === '2' ? [row('third', 'Third Student')] : filters.page === '2' ? [row('second', 'Second Student')] : [row('first', 'First Student')];
      return { success: true, students, departments: [{ id: 1, code: 'CCS' }, { id: 2, code: 'CN' }], courses: [{ id: 1, short_name: 'BSCS' }], pagination: { page: Number(filters.page), total: 2, totalPages: 2 } };
    },
    async getBulkDtrPins() { return { success: true, locations: [] }; },
    async assignBulkDtrLocations(body) { calls.push(body); return result; },
  };
  const { default: Page } = load('components/dtr-locations-ui/BulkDtrLocations.js', {
    '@tanstack/react-query': ReactQuery,
    'next/dynamic': { __esModule: true, default: () => MapStub },
    '@/contexts/UserContext': { useUser: () => ({ user: { id: 'admin', role: 'admin' } }) },
    '@/components/ui/SocketProvider': { socket: { on: (event, callback) => listeners.set(event, callback), off: event => listeners.delete(event) } },
    '@/components/ui/button': { Button }, '@/components/ui/checkbox': { Checkbox },
    '@/components/ui/DropdownFilter': { __esModule: true, default: ({ value, onValueChange, options, disabled, 'aria-label': label }) => React.createElement('select', { 'aria-label': label, value: value || 'all', disabled, onChange: event => onValueChange(event.target.value === 'all' ? '' : event.target.value) }, options.map(option => React.createElement('option', { key: option.value, value: option.value || 'all' }, option.label))) },
    '@/components/ui/select': { Select, SelectTrigger, SelectContent: Empty, SelectItem: Empty, SelectValue: Empty },
    '@/components/ui/ConfirmDialog': { __esModule: true, default: Confirmation },
    '@/components/ui/ErrorUI': { __esModule: true, default: ({ error }) => React.createElement('div', { role: 'alert' }, error.message) },
    '@/components/help-ui/HelpManual': { __esModule: true, default: Empty },
    '@/components/skeletons/EditableMapSkeleton': { __esModule: true, default: Empty },
    '@/lib/server-actions/bulk-dtr-actions': api,
    '@/lib/bulk-dtr-selection.mjs': { selectDtrPage, remainingDtrSelection, validDtrDraft, MAX_DTR_SELECTION: 100 },
    '@/lib/toast-and-action.mjs': { showActionError() {} },
    './BulkDtrSkeleton': { StudentTableSkeleton: () => React.createElement('span', null, 'Students loading') },
    './StudentAvatar': { __esModule: true, default: StudentAvatar },
    sonner: { toast: { loading() { return 'loading'; }, success() {} } },
  });
  const settle = async () => { await act(async () => { await new Promise(resolve => setTimeout(resolve, 30)); }); };
  const click = async label => { const button = [...document.querySelectorAll('button')].find(b => b.textContent.includes(label)); assert(button, label); await act(async () => button.click()); await settle(); };
  const check = async label => { const input = document.querySelector(`input[aria-label="${label}"]`); assert(input, label); await act(async () => input.click()); await settle(); };
  const change = async (label, value) => { await act(async () => { const select = document.querySelector(`select[aria-label="${label}"]`); select.value = value; select.dispatchEvent(new dom.window.Event('change', { bubbles: true })); }); await settle(); };
  try {
    await act(async () => root.render(React.createElement(QueryClientProvider, { client: queryClient }, React.createElement(Page)))); await settle();
    assert([...document.querySelectorAll('button')].find(b => b.textContent.includes('Review assignment')).disabled);
    await check('Select all students on this page');
    await click('Next');
    assert(document.querySelector('[aria-label="Remove First Student from selection"]'));
    await check('Select Second Student');
    await change('Courses', '1'); await change('Departments', '2');
    assert.equal(document.querySelector('select[aria-label="Courses"]').value, 'all');
    assert(document.querySelector('[aria-label="Remove Second Student from selection"]'));
    assert(reads.some(f => f.departmentId === '2' && !f.courseId));
    await click('Choose location');
    await act(async () => document.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })));
    assert.match(document.querySelector('[role="dialog"]').textContent, /Assign 2 students to Hospital entrance/);
    result = { success: true, summary: { assigned: 1, unchanged: 0, failed: 1 }, message: '1 assigned, 0 unchanged, 1 not assigned.', results: [{ internship_id: 'first', status: 'assigned' }, { internship_id: 'second', status: 'failed', reason: 'No longer ongoing' }] };
    await click('Confirm save');
    assert.deepEqual(Array.from(calls[0].internshipIds), ['first', 'second']);
    assert(!document.querySelector('[aria-label="Remove First Student from selection"]'));
    assert(document.querySelector('[aria-label="Remove Second Student from selection"]'));
    assert.match(document.body.textContent, /Second Student: No longer ongoing/);
    assert(!document.querySelector('[role="dialog"]'));
    // A fresh denial must mask previously successful table/map data.
    api.getBulkDtrStudents = async () => ({ success: false, status: 403, error: 'Access denied' });
    await act(async () => { await queryClient.invalidateQueries({ queryKey: ['bulk-dtr-locations', 'admin'] }); }); await settle();
    assert(!document.querySelector('table')); assert.match(document.querySelector('[role="alert"]').textContent, /Access denied/);
  } finally {
    await act(async () => root.unmount()); queryClient.clear(); dom.window.close();
    globalThis.window = previous.window; globalThis.document = previous.document;
    if (previous.navigator) Object.defineProperty(globalThis, 'navigator', previous.navigator); else delete globalThis.navigator;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previous.act;
  }
  assert.equal(listeners.size, 0);
});
