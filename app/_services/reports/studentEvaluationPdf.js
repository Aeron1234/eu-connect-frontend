import { runPdfJob } from "../pdfBrowser.js";
import { BACKEND_URL, HEI_NAME } from "./reportConfig.js";
import { studentEvaluationHtml } from "../pdfTemplates.js";

export async function generateStudentEvaluationPdf(evaluationId, accessToken) {
  return runPdfJob(async ({ signal, renderPdf }) => {
    const url = new URL(
      `${BACKEND_URL}/evaluations/student/${evaluationId}/print`,
    );

    const res = await fetch(url, {
      signal,
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 403) {
      const { error } = await res.json().catch(() => ({}));
      throw Object.assign(new Error(error || "Not authorized to export this evaluation."), { status: 403 });
    }
    if (res.status === 404) return null;
    if (!res.ok) throw Object.assign(new Error(`Backend returned ${res.status}`), { status: res.status });

    const data = await res.json();

    const html = studentEvaluationHtml({
      hei: HEI_NAME,
      departmentName: data.department_name,
      studentName: data.student_name,
      companyName: data.company_name,
      categories: data.categories,
      remarks: data.other_remarks,
    });

    return renderPdf(html, { landscape: false, preferCSSPageSize: true });
  });
}
