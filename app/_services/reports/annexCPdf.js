import { runPdfJob } from "../pdfBrowser.js";
import { BACKEND_URL, HEI_NAME, HEI_ADDRESS } from "./reportConfig.js";
import { annexCHtml } from "../pdfTemplates.js";

export async function generateAnnexCPdf(reportId, accessToken) {
  return runPdfJob(async ({ signal, renderPdf }) => {
    const url = new URL(`${BACKEND_URL}/reports/annex-c/${reportId}`);

    const res = await fetch(url, {
      signal,
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 403)
      throw Object.assign(new Error("Not authorized to export this report."), { status: 403 });
    if (res.status === 404) return null;
    if (!res.ok) throw Object.assign(new Error(`Backend returned ${res.status}`), { status: res.status });

    const data = await res.json();

    const html = annexCHtml({
      ay: data.academic_year,
      hei: HEI_NAME,
      address: HEI_ADDRESS,
      degreeProgram: data.degree_program,
      rows: data.entries.map((e) => ({
        issues: e.issue,
        solutions: e.solution,
        recommendations: e.recommendation,
      })),
      preparedBy: data.prepared_by_export || data.prepared_by || "",
      certifiedBy: data.certified_by || "",
    });

    return renderPdf(html, { landscape: true, preferCSSPageSize: true });
  });
}
