import { createPdfRuntime } from "./pdfRuntime.mjs";

async function launchBrowser() {
  if (process.env.VERCEL) {
    // Vercel uses the packaged Sparticuz executable with puppeteer-core.
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = await import("puppeteer-core");
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
      timeout: 10_000,
      protocolTimeout: 10_000,
    });
  } else {
    // Other Node hosts, including local development and a VPS, use Puppeteer's browser.
    // This branch is selected by VERCEL, not NODE_ENV.
    const puppeteer = await import("puppeteer");
    return puppeteer.launch({ headless: true, timeout: 10_000, protocolTimeout: 10_000 });
  }
}

// Share the guard even if separate route bundles load this module twice in
// the same process. Separate Vercel instances still have independent limits.
const runtimeKey = Symbol.for("eu-connect.pdf-runtime.v1");
const runtime = globalThis[runtimeKey] ??= createPdfRuntime({
  launchBrowser,
  // Sparticuz's --single-process build cannot reliably create isolated
  // contexts. Serialize fresh browsers there; reuse contexts on local/VPS.
  reuseBrowser: !process.env.VERCEL,
});

export const runPdfJob = (work) => runtime.run(work);
