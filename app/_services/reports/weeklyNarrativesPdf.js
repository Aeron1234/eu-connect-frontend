import { runPdfJob } from "../pdfBrowser.js";
import { BACKEND_URL } from "./reportConfig.js";
import { weeklyNarrativesHtml } from "../weeklyNarrativesTemplate.js";

export async function generateWeeklyNarrativesPdf(internshipId, accessToken) {
  return runPdfJob(async ({ signal, renderPdf }) => {
    const response = await fetch(
      `${BACKEND_URL}/api/weekly-narratives/print/${encodeURIComponent(internshipId)}`,
      { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store", signal },
    );
    if (response.status === 404) return null;
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw Object.assign(new Error(data.error || "Could not load weekly narratives."), { status: response.status });
    }
    const record = await response.json();
    return renderPdf(weeklyNarrativesHtml(record), { landscape: false, preferCSSPageSize: true });
  });
}
