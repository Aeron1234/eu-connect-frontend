import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { test } from "node:test";
import { createPdfRuntime, readPdfImage } from "../app/_services/pdfRuntime.mjs";
import { pdfErrorResponse } from "../app/_services/pdfResponse.mjs";

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

function fixture(t, options = {}) {
  const state = { launches: 0, alive: 0, peak: 0, contexts: [], closes: 0, kills: 0, contextAttempts: 0 };
  const runtime = createPdfRuntime({
    ...options,
    launchBrowser: async () => {
      state.launches++;
      if (options.launchError && state.launches === 1) throw new Error("Launch failed");
      const browser = new EventEmitter();
      browser.connected = true;
      state.alive++;
      state.peak = Math.max(state.peak, state.alive);
      const stop = () => {
        if (!browser.connected) return;
        browser.connected = false;
        state.alive--;
        browser.emit("disconnected");
      };
      browser.close = async () => { state.closes++; stop(); };
      browser.process = () => ({ kill: () => { state.kills++; stop(); } });
      function pageFor(context) {
        return {
          setDefaultTimeout() {},
          async setContent(html) { context.html = html; },
          async evaluate() { return options.imagesReady !== false; },
          async pdf(settings) {
            context.settings = settings;
            if (options.pdfError && state.contexts.length === 1) {
              throw Object.assign(new Error("Render timed out"), { name: "TimeoutError" });
            }
            return Buffer.from(`%PDF-${context.html}`);
          },
          async close() { context.closed = true; },
        };
      }
      browser.createBrowserContext = async () => {
        state.contextAttempts++;
        const context = { closed: false };
        context.newPage = async () => pageFor(context);
        context.close = async () => {
          if (options.hangCleanup) await new Promise(() => {});
          context.closed = true;
        };
        state.contexts.push(context);
        return context;
      };
      browser.newPage = async () => {
        const context = { closed: false };
        state.contexts.push(context);
        return pageFor(context);
      };
      return browser;
    },
  });
  t.after(() => runtime.close());
  return { runtime, state };
}

test("warm exports share one browser and use separate, closed contexts with original PDF options", async (t) => {
  const { runtime, state } = fixture(t);
  const results = await Promise.all(["one", "two", "three"].map((html) =>
    runtime.run(({ renderPdf }) => renderPdf(html, { landscape: false, preferCSSPageSize: true }))));
  assert.deepEqual(results.map(String), ["%PDF-one", "%PDF-two", "%PDF-three"]);
  assert.equal(state.launches, 1);
  assert.equal(state.peak, 1);
  assert.equal(state.contexts.length, 3);
  assert.ok(state.contexts.every((context) => context.closed));
  assert.equal(state.contexts[0].settings.format, "A4");
  assert.equal(state.contexts[0].settings.landscape, false);
  assert.equal(state.contexts[0].settings.preferCSSPageSize, true);
});

test("single-process serverless exports use fresh browsers sequentially without isolated contexts", async (t) => {
  const { runtime, state } = fixture(t, { reuseBrowser: false });
  await Promise.all([1, 2, 3].map((id) => runtime.run(({ renderPdf }) => renderPdf(String(id)))));
  assert.equal(state.launches, 3);
  assert.equal(state.closes, 3);
  assert.equal(state.peak, 1);
  assert.equal(state.contextAttempts, 0);
  assert.equal(state.alive, 0);
});

test("a fifteen-request burst starts one job, queues four, and rejects excess work before data preparation", async (t) => {
  const { runtime, state } = fixture(t);
  const gate = deferred();
  let preparations = 0;
  const outcomes = Promise.allSettled(Array.from({ length: 15 }, (_, i) => runtime.run(async ({ renderPdf }) => {
    preparations++;
    await gate.promise;
    return renderPdf(String(i));
  })));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(preparations, 1);
  gate.resolve();
  const results = await outcomes;
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 5);
  const rejected = results.filter((result) => result.status === "rejected");
  assert.equal(rejected.length, 10);
  assert.ok(rejected.every((result) => result.reason.code === "PDF_BUSY" && result.reason.status === 503));
  assert.equal(state.peak, 1);
});

test("queue expiry removes a waiting job and never starts its data fetch", async (t) => {
  const { runtime } = fixture(t, { queueTimeoutMs: 10 });
  const gate = deferred();
  const first = runtime.run(() => gate.promise);
  let started = false;
  await assert.rejects(runtime.run(() => { started = true; }), { code: "PDF_BUSY", status: 503 });
  gate.resolve();
  await first;
  assert.equal(started, false);
  assert.equal(await runtime.run(() => "recovered"), "recovered");
});

test("an expired job keeps its permit until its aborted operations finish unwinding", async (t) => {
  const { runtime } = fixture(t, { jobTimeoutMs: 15, queueTimeoutMs: 1000 });
  const aborted = deferred();
  const drained = deferred();
  const first = assert.rejects(runtime.run(async ({ signal }) => {
    await new Promise((resolve) => signal.addEventListener("abort", resolve, { once: true }));
    aborted.resolve();
    await drained.promise;
    return "late result";
  }), { code: "PDF_TIMEOUT", status: 504 });
  let nextStarted = false;
  const next = runtime.run(() => { nextStarted = true; return "next"; });
  await aborted.promise;
  assert.equal(nextStarted, false);
  drained.resolve();
  await first;
  assert.equal(await next, "next");
});

test("launch and PDF timeouts reset the browser and allow a later export", async (t) => {
  for (const options of [{ launchError: true }, { pdfError: true }]) {
    const { runtime, state } = fixture(t, options);
    await assert.rejects(runtime.run(({ renderPdf }) => renderPdf("first")));
    assert.equal(String(await runtime.run(({ renderPdf }) => renderPdf("second"))), "%PDF-second");
    assert.equal(state.launches, 2);
    assert.equal(state.peak, 1);
  }
});

test("missing images close the export context and do not cache a PDF", async (t) => {
  const { runtime, state } = fixture(t, { imagesReady: false });
  await assert.rejects(runtime.run(({ renderPdf }) => renderPdf("image", {}, true)), /report image/);
  assert.equal(state.contexts[0].closed, true);
  assert.equal(String(await runtime.run(({ renderPdf }) => renderPdf("text"))), "%PDF-text");
  assert.equal(state.launches, 1);
});

test("stuck context cleanup discards the browser before the next export", async (t) => {
  const { runtime, state } = fixture(t, { hangCleanup: true, cleanupTimeoutMs: 5 });
  await runtime.run(({ renderPdf }) => renderPdf("first"));
  await runtime.run(({ renderPdf }) => renderPdf("second"));
  assert.equal(state.closes, 2);
  assert.equal(state.launches, 2);
  assert.equal(state.alive, 0);
});

test("missing or forbidden reports do not launch Chromium", async (t) => {
  const { runtime, state } = fixture(t);
  assert.equal(await runtime.run(() => null), null);
  await assert.rejects(runtime.run(() => { throw Object.assign(new Error("Access denied"), { status: 403 }); }), { status: 403 });
  assert.equal(state.launches, 0);
});

test("image reads enforce limits with and without Content-Length and cancel oversized streams", async () => {
  const signal = new AbortController().signal;
  assert.equal(String(await readPdfImage(new Response("1234"), signal, 4)), "1234");
  for (const headers of [{}, { "Content-Length": "5" }]) {
    let cancelled = false;
    const stream = new ReadableStream({
      pull(controller) { controller.enqueue(new Uint8Array([1, 2, 3])); },
      cancel() { cancelled = true; },
    });
    await assert.rejects(readPdfImage(new Response(stream, { headers }), signal, 4), { status: 422 });
    assert.equal(cancelled, true);
  }
});

test("PDF error responses preserve validation, expose safe busy/timeout errors, and hide internal failures", async () => {
  for (const [status, code, message] of [
    [503, "PDF_BUSY", "PDF exports are busy."], [504, "PDF_TIMEOUT", "Preparing the PDF took too long."],
    [403, undefined, "Access denied."], [422, undefined, "Report exceeds three pages."],
  ]) {
    const response = pdfErrorResponse(Object.assign(new Error(message), { status, code }), "Export failed.");
    assert.equal(response.status, status);
    assert.equal((await response.json()).error, message);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    if (code === "PDF_BUSY") assert.equal(response.headers.get("retry-after"), "5");
  }
  const failed = pdfErrorResponse(new Error("Internal browser path or secret"), "Export failed.");
  assert.equal(failed.status, 500);
  assert.equal((await failed.json()).error, "Export failed.");
});
