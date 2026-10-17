import { runPdfJob } from "../pdfBrowser.js";
import { BACKEND_URL } from "./reportConfig.js";
import { readPdfImage } from "../pdfRuntime.mjs";
import { summaryReportHtml } from "../summaryReportTemplate.js";

export async function generateSummaryReportPdf(internshipId, accessToken) {
  return runPdfJob(async ({ signal, renderPdf }) => {
    const headers = { Authorization: `Bearer ${accessToken}` };
    const listResponse = await fetch(`${BACKEND_URL}/summary-reports`, {
      headers,
      cache: "no-store",
      signal,
    });
    if (listResponse.status === 403) throw Object.assign(new Error("Not authorized to print this report."), { status: 403 });
    if (!listResponse.ok) throw Object.assign(new Error(`Backend returned ${listResponse.status}`), { status: listResponse.status });
    const { records = [] } = await listResponse.json();
    const report = records.find((item) => item.internship_id === internshipId && item.report_id);
    if (!report) return null;

    const images = report.images || [];
    if (images.length > 6) throw Object.assign(new Error("A summary report can have up to six images."), { status: 422 });
    const imageDataUrls = [];
    for (const image of images) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(image.type) || !image.url) {
        throw new Error("Could not load a report image.");
      }
      const response = await fetch(image.url, { cache: "no-store", signal });
      if (!response.ok) throw new Error("Could not load a report image.");
      const bytes = await readPdfImage(response, signal);
      imageDataUrls.push(`data:${image.type};base64,${bytes.toString("base64")}`);
    }

    const pdf = await renderPdf(summaryReportHtml(report, imageDataUrls), {
      landscape: false,
      preferCSSPageSize: true,
    }, imageDataUrls.length > 0);
    const pageCount = (Buffer.from(pdf).toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
    if (pageCount > 3) {
      throw Object.assign(new Error("The report exceeds three pages. Shorten the text or remove an image before printing."), { status: 422 });
    }
    return pdf;
  });
}
