import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as responses from '../lib/api-response.js';
const require = createRequire(import.meta.url);
const { transformSync } = require('next/dist/compiled/babel/core');
const hooks = { ...React, useState: value => [typeof value === 'function' ? value() : value, () => {}] };
function load(file, mocks = {}, globals = {}) {
  const url = new URL('../' + file, import.meta.url);
  const { code } = transformSync(readFileSync(url, 'utf8'), { filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require('next/babel'), { 'preset-env': { modules: 'commonjs' }, 'preset-react': { runtime: 'automatic' } }]] });
  const mod = { exports: {} };
  vm.runInNewContext(code, { module: mod, exports: mod.exports, ...globals, require(id) { if (id === "@/components/skeletons/EvaluationCriteriaSkeleton") return () => null; return Object.hasOwn(mocks, id) ? mocks[id] : require(id); } });
  return mod.exports;
}
const example = { id: 'evaluation', type: 'Performance Evaluation', evaluator_id: 'author', period: 'October 2026', evaluator: 'Employer', submittedDate: 'Oct 21, 2026', breakdown: [] };

test('delete and print permissions distinguish author soft deletion from staff purge for both directions', () => {
  for (const type of ['Performance Evaluation', 'Supervisor Evaluation']) for (const deleted of [false, true]) {
    for (const role of ['employer', 'student', 'admin', 'department_head']) for (const id of ['author', 'other']) {
      const Hook = load('components/evaluations-ui/usePostedEvaluation.js', { react: hooks,
        '@/contexts/UserContext': { useUser: () => ({ user: { role, id } }) } }).default;
      const value = Hook({ ev: { ...example, type, deleted_at: deleted ? 'date' : null } });
      const staff = ['admin', 'department_head'].includes(role);
      const author = id === 'author' && role === (type === 'Performance Evaluation' ? 'employer' : 'student');
      assert.equal(value.canDelete, staff ? deleted : author && !deleted);
      assert.equal(value.canPrint, type === 'Performance Evaluation' && (staff || (author && !deleted)));
    }
  }
});

test('deleted cached summaries are hidden from both author roles but remain visible for staff', () => {
  const items = [{ ...example, comments: 'Active scores' }, { ...example, id: 'deleted', deleted_at: 'date', comments: 'Deleted scores' },
    { ...example, id: 'own', type: 'Supervisor Evaluation', comments: 'Own supervisor scores' }, { ...example, id: 'old-own', type: 'Supervisor Evaluation', deleted_at: 'date', comments: 'Deleted supervisor scores' }];
  for (const role of ['student', 'employer', 'admin', 'department_head']) {
    const Card = load('components/evaluations-ui/EvaluationCard.js', {
      './useEvaluationItems': () => ({ items }), '@/contexts/UserContext': { useUser: () => ({ user: { role } }) },
      './PostedEvaluationItem': ({ ev }) => ev.comments, './EvaluationEmptyState': () => null,
    }).default;
    const html = renderToStaticMarkup(React.createElement(Card, { evaluations: items }));
    assert.equal(html.includes('Deleted scores'), ['admin', 'department_head'].includes(role));
    assert.equal(html.includes('Deleted supervisor scores'), ['admin', 'department_head'].includes(role));
    if (role === 'student') { assert(!html.includes('Active scores')); assert(html.includes('Own supervisor scores')); }
  }
});

test('posting guard fails closed on loading/errors and hides the form until an active slot is available', () => {
  for (const state of [{ isPending: true }, { isError: true, error: Error('offline') }, { data: { can_post: false, message: 'Already evaluated' } }, { data: { can_post: true } }]) {
    const Guard = load('components/evaluations-ui/EvaluationPostingGuard.js', {
      '@tanstack/react-query': { useQuery: () => state }, '@/contexts/UserContext': { useUser: () => ({ user: { id: 'author' } }) },
      '@/lib/server-actions/evaluations-actions': {}, '@/components/ui/ErrorUI': () => 'Retry error',
    }).default;
    const html = renderToStaticMarkup(React.createElement(Guard, { direction: 'performance', studentId: 'student' }, 'Evaluation form'));
    assert.equal(html.includes('Evaluation form'), Boolean(state.data?.can_post));
  }
});

test('performance form submits directly once without a confirmation state', async () => {
  const jobs = [], posts = [], invalidations = [];
  const action = async data => { posts.push(data); return { success: true }; };
  const Hook = load('components/evaluations-ui/useStudentEvaluationForm.js', {
    react: { ...hooks, useTransition: () => [false, work => jobs.push(work())] },
    '@tanstack/react-query': { useQueryClient: () => ({ invalidateQueries: value => invalidations.push(value) }) },
    '@/lib/helpers': { toastAndAction: value => value.action(...value.args) },
    '@/lib/server-actions/evaluations-actions': { postStudentEvaluation: action },
  }).default;
  const form = Hook({ studentEvaluationCriterias: [{ items: [{ id: 'Quality' }] }], searchedUserId: 'student' });
  assert.equal('confirming' in form, false);
  form.handleEvaluation({ preventDefault() {} }); await Promise.all(jobs);
  assert.equal(posts.length, 1); assert.equal(posts[0].student_id, 'student'); assert.equal(invalidations.length, 1);
});

test('deleted badges remain visible to staff without rendering a pending status or confirmation controls', () => {
  const Header = load('components/evaluations-ui/PostedEvaluationHeader.js', {
    '../ui/Modal': () => null, './StudentEvaluationDeleteForm': () => null, './EvaluationCircularScore': () => null,
  }).default;
  for (const deleted of [false, true]) {
    const html = renderToStaticMarkup(React.createElement(Header, { ev: { ...example, status: 'Pending', deleted_at: deleted ? 'date' : null }, open: false, setOpen() {}, total: 0, totalMax: 0 }));
    assert.equal(html.includes('Deleted'), deleted); assert(!html.includes('Pending'));
  }
});

test('deletion sends each direction to the right API and revalidates only after success', async () => {
  const calls = [], paths = []; let ok = true;
  const actions = load('lib/server-actions/evaluations-actions.js', {
    react: { cache: fn => fn }, '../api-base-url.mjs': { getApiBaseUrl: () => 'https://backend.example/api/v1' },
    './auth': { getAccessToken: async () => 'test-token', getUserSession: async () => ({ user: { id: 'author' } }) },
    '../api-response': responses, 'next/cache': { revalidatePath: path => paths.push(path) },
  }, { console, fetch: async (url, options) => { calls.push({ url, options }); return Response.json(ok ? { success: true } : { error: 'Forbidden' }, { status: ok ? 200 : 403 }); } });
  for (const type of ['Performance Evaluation', 'Supervisor Evaluation']) {
    const data = new FormData(); data.set('evaluationId', 'record'); data.set('evaluationType', type);
    assert.equal((await actions.deleteEvaluation(data)).success, true);
  }
  assert(calls[0].url.endsWith('/student-evaluation/record')); assert(calls[1].url.endsWith('/evaluations/employer/record'));
  assert(calls.every(value => value.options.method === 'DELETE')); const count = paths.length;
  ok = false; const data = new FormData(); data.set('evaluationId', 'record'); data.set('evaluationType', 'Supervisor Evaluation');
  assert.equal((await actions.deleteEvaluation(data)).success, false); assert.equal(paths.length, count);
});
