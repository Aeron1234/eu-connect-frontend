function pdfFailure(code, status, message) {
  return Object.assign(new Error(message), { code, status });
}

const busy = () => pdfFailure("PDF_BUSY", 503, "PDF exports are busy. Please wait a moment and try again.");
const timedOut = () => pdfFailure("PDF_TIMEOUT", 504, "Preparing the PDF took too long. Please try again.");

async function settleWithin(promise, milliseconds) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => { timer = setTimeout(() => reject(timedOut()), milliseconds); }),
    ]);
  } finally { clearTimeout(timer); }
}

// Process-local protection. Vercel can run several independent instances;
// this is deliberately not a deployment-wide queue or persistent job store.
export function createPdfRuntime({
  launchBrowser,
  maxQueued = 4,
  queueTimeoutMs = 15_000,
  jobTimeoutMs = 30_000,
  operationTimeoutMs = 10_000,
  cleanupTimeoutMs = 2_000,
  reuseBrowser = true,
}) {
  let active = false;
  const queue = [];
  let browserPromise = null;

  function acquire() {
    if (!active) { active = true; return Promise.resolve(); }
    if (queue.length >= maxQueued) return Promise.reject(busy());
    return new Promise((resolve, reject) => {
      const entry = { resolve, timer: null };
      entry.timer = setTimeout(() => {
        const index = queue.indexOf(entry);
        if (index >= 0) queue.splice(index, 1);
        reject(busy());
      }, queueTimeoutMs);
      queue.push(entry);
    });
  }

  function release() {
    const next = queue.shift();
    if (next) { clearTimeout(next.timer); next.resolve(); }
    else active = false;
  }

  function killBrowser() {
    // Also handles a launch that finishes after the job has been aborted.
    if (browserPromise) void browserPromise.then((browser) => {
      try { browser.process()?.kill("SIGKILL"); } catch { /* close below also cleans up */ }
    }).catch(() => {});
  }

  async function discardBrowser() {
    const pending = browserPromise;
    browserPromise = null;
    const browser = await pending?.catch(() => null);
    if (!browser) return;
    try { await settleWithin(browser.close(), cleanupTimeoutMs); }
    catch { try { browser.process()?.kill("SIGKILL"); } catch { /* already exited */ } }
  }

  async function getBrowser() {
    if (browserPromise) {
      const browser = await browserPromise;
      if (browser.connected) return browser;
      await discardBrowser();
    }
    const pending = Promise.resolve().then(launchBrowser);
    browserPromise = pending;
    try {
      const browser = await pending;
      browser.once("disconnected", () => {
        if (browserPromise === pending) browserPromise = null;
      });
      return browser;
    } catch (error) {
      if (browserPromise === pending) browserPromise = null;
      throw error;
    }
  }

  async function renderPdf(signal, html, options = {}, verifyImages = false) {
    signal.throwIfAborted();
    const browser = await getBrowser();
    signal.throwIfAborted();
    let context;
    let page;
    try {
      // A reused browser needs an isolated context. Serverless single-process
      // Chromium uses a fresh browser per job because contexts can crash it.
      if (reuseBrowser) context = await browser.createBrowserContext();
      signal.throwIfAborted();
      page = await (context || browser).newPage();
      page.setDefaultTimeout(operationTimeoutMs);
      await page.setContent(html, { waitUntil: "networkidle0", timeout: operationTimeoutMs });
      signal.throwIfAborted();
      if (verifyImages) {
        const imagesReady = await page.evaluate(() =>
          [...document.images].every((image) => image.complete && image.naturalWidth > 0));
        if (!imagesReady) throw new Error("Could not render the report image.");
      }
      signal.throwIfAborted();
      return await page.pdf({
        format: "A4", landscape: true, printBackground: true,
        ...options, timeout: operationTimeoutMs,
      });
    } finally {
      if (context || page) {
        try { await settleWithin((context || page).close(), cleanupTimeoutMs); }
        catch { await discardBrowser(); }
      }
    }
  }

  async function run(work) {
    // Acquire before fetching report data or images, not only before Chromium.
    await acquire();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(timedOut()), jobTimeoutMs);
    controller.signal.addEventListener("abort", killBrowser, { once: true });
    try {
      const result = await work({
        signal: controller.signal,
        renderPdf: (...args) => renderPdf(controller.signal, ...args),
      });
      controller.signal.throwIfAborted();
      return result;
    } catch (error) {
      if (controller.signal.aborted || error?.name === "TimeoutError") {
        controller.abort(timedOut());
        throw timedOut();
      }
      throw error;
    } finally {
      clearTimeout(timer);
      controller.signal.removeEventListener("abort", killBrowser);
      if (controller.signal.aborted || !reuseBrowser) await discardBrowser();
      // Never start another job while an aborted operation is still unwinding.
      release();
    }
  }

  return { run, close: discardBrowser };
}

// Bound image buffering even if a storage response omits Content-Length.
export async function readPdfImage(response, signal, maxBytes = 5 * 1024 * 1024) {
  const tooLarge = () => pdfFailure("PDF_IMAGE_TOO_LARGE", 422, "A report image is too large to export.");
  if (Number(response.headers.get("content-length")) > maxBytes) {
    await response.body?.cancel().catch(() => {});
    throw tooLarge();
  }
  if (!response.body) throw new Error("Could not load a report image.");
  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      signal.throwIfAborted();
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) throw tooLarge();
      chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks, total);
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally { reader.releaseLock(); }
}
