import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { fetchUpload, uploadRequestFailure } from '../lib/upload-request.mjs';
import * as apiResponse from '../lib/api-response.js';

const require = createRequire(import.meta.url);
const { transformSync } = require('next/dist/compiled/babel/core');
const waitForAbort = (_, { signal }) => new Promise((resolve, reject) => { signal.addEventListener('abort', () => reject(signal.reason), { once: true }); });

test('upload HTTP requests abort and retain their FormData, authentication and multipart handling', async () => {
  const alive = setTimeout(() => {}, 1000);
  try {
    const body = new FormData(); body.set('file_name', 'Requirement');
    await assert.rejects(fetchUpload('https://api.example.test/upload', { method: 'POST', body, headers: { Authorization: 'Bearer test' } }, { timeoutMs: 5, fetcher: (url, options) => {
      assert.equal(options.body, body); assert.equal(options.headers.Authorization, 'Bearer test'); assert.equal(options.headers['Content-Type'], undefined); return waitForAbort(url, options);
    } }), error => error.name === 'TimeoutError');
    const failure = uploadRequestFailure(new DOMException('deadline', 'TimeoutError')); assert.equal(failure.success, false); assert.equal(failure.timedOut, true); assert.match(failure.error, /Refresh/);
  } finally { clearTimeout(alive); }
});

test('upload requests preserve cancellation and network errors do not expose internal details', async () => {
  const controller = new AbortController();
  const pending = fetchUpload('https://api.example.test/upload', { signal: controller.signal }, { fetcher: waitForAbort }); controller.abort();
  await assert.rejects(pending, error => error.name === 'AbortError');
  assert.equal(uploadRequestFailure(new Error('private connection details')).error.includes('private'), false);
});

function actionFile(file, fetcher) {
  const url = new URL('../lib/server-actions/' + file, import.meta.url);
  const { code } = transformSync(readFileSync(url, 'utf8'), { filename: url.pathname, babelrc: false, configFile: false,
    presets: [[require('next/babel'), { 'preset-env': { modules: 'commonjs' }, 'preset-react': { runtime: 'automatic' } }]] });
  const invalidations = [];
  const mocks = { '../api-base-url.mjs': { getApiBaseUrl: () => 'https://api.example.test/api/v1' }, './auth': { getAccessToken: async () => 'test-token' }, 'next/cache': { revalidatePath: path => invalidations.push(path) }, react: { cache: fn => fn }, '../api-response': apiResponse, '../upload-request.mjs': { uploadRequestFailure, fetchUpload: (url, options) => fetchUpload(url, options, { fetcher, timeoutMs: 5 }) } };
  const mod = { exports: {} };
  vm.runInNewContext(code, { module: mod, exports: mod.exports, console: { error() {} }, require(id) { return Object.hasOwn(mocks, id) ? mocks[id] : require(id); } });
  return { actions: mod.exports, invalidations };
}

test('student documents, employer certificates and summary uploads return a timeout failure without success invalidation', async () => {
  const alive = setTimeout(() => {}, 1000);
  try {
    for (const [file, name, args] of [['internship-docs-actions.js', 'uploadInternshipFile', [new FormData()]], ['internship-docs-actions.js', 'uploadCertificateOfCompletion', [new FormData()]], ['summary-reports-actions.js', 'saveSummaryReport', ['record', new FormData(), false]]]) {
      const view = actionFile(file, waitForAbort); const result = await view.actions[name](...args);
      assert.equal(result.success, false, name); assert.equal(result.timedOut, true, name); assert.equal(view.invalidations.length, 0);
    }
  } finally { clearTimeout(alive); }
});

test('ordinary upload validation errors still return the backend message', async () => {
  const view = actionFile('internship-docs-actions.js', async () => new Response(JSON.stringify({ error: 'Invalid requirement type.' }), { status: 400 }));
  const result = await view.actions.uploadInternshipFile(new FormData());
  assert.equal(result.success, false); assert.equal(result.error, 'Invalid requirement type.'); assert.equal(view.invalidations.length, 0);
});
