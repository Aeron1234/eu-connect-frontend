export async function getBrowser() {
  if (process.env.VERCEL) {
    // Production / serverless
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = await import("puppeteer-core");
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  } else {
    // Local dev
    const puppeteer = await import("puppeteer");
    return puppeteer.launch({ headless: true });
  }
}
