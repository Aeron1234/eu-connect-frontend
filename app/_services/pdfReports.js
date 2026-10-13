import { getBrowser } from "./pdfBrowser";
import { annexCHtml, annexDHtml, studentEvaluationHtml } from "./pdfTemplates";
import { summaryReportHtml } from "./summaryReportTemplate";
import { weeklyNarrativesHtml } from "./weeklyNarrativesTemplate";

const HEI_NAME = "Manuel S. Enverga University Foundation-Candelaria, Inc.";
const HEI_ADDRESS = "Malabanban Norte, Candelaria, Quezon";
const BACKEND_URL = process.env.API_BASE_URL;

async function renderPdf(html, options = {}, verifyImages = false) {
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    if (verifyImages) {
      const imagesReady = await page.evaluate(() =>
        [...document.images].every((image) => image.complete && image.naturalWidth > 0),
      );
      if (!imagesReady) throw new Error("Could not render the report image.");
    }
    return await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      ...options,
    });
  } finally {
    await browser.close();
  }
}

export async function generateWeeklyNarrativesPdf(internshipId, accessToken) {
  const response = await fetch(
    `${BACKEND_URL}/api/weekly-narratives/print/${encodeURIComponent(internshipId)}`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" },
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw Object.assign(new Error(data.error || "Could not load weekly narratives."), { status: response.status });
  }
  const record = await response.json();
  return renderPdf(weeklyNarrativesHtml(record), { landscape: false, preferCSSPageSize: true });
}

export async function generateSummaryReportPdf(internshipId, accessToken) {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const listResponse = await fetch(`${BACKEND_URL}/api/summary-reports`, {
    headers,
    cache: "no-store",
  });
  if (listResponse.status === 403) throw Object.assign(new Error("Not authorized to print this report."), { status: 403 });
  if (!listResponse.ok) throw new Error(`Backend returned ${listResponse.status}`);
  const { records = [] } = await listResponse.json();
  const report = records.find((item) => item.internship_id === internshipId && item.report_id);
  if (!report) return null;

  const imageDataUrls = await Promise.all((report.images || []).map(async (image) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(image.type) || !image.url) {
      throw new Error("Could not load a report image.");
    }
    const response = await fetch(image.url, { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load a report image.");
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 5 * 1024 * 1024) throw new Error("A report image is too large to print.");
    return `data:${image.type};base64,${bytes.toString("base64")}`;
  }));

  const pdf = await renderPdf(summaryReportHtml(report, imageDataUrls), {
    landscape: false,
    preferCSSPageSize: true,
  }, imageDataUrls.length > 0);
  const pageCount = (Buffer.from(pdf).toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
  if (pageCount > 3) {
    throw Object.assign(new Error("The report exceeds three pages. Shorten the text or remove an image before printing."), { status: 422 });
  }
  return pdf;
}

export async function generateAnnexDPdf(companyKey, academicYear, accessToken) {
  const url = new URL(`${BACKEND_URL}/api/reports/hte-annual/company`);
  url.searchParams.set("academicYear", academicYear);
  url.searchParams.set("companyKey", companyKey);

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 403)
    throw new Error("Not authorized to export this report.");
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Backend returned ${res.status}`);

  const data = await res.json();

  const html = annexDHtml({
    ay: data.academicYear,
    hei: HEI_NAME,
    address: HEI_ADDRESS,
    company: {
      name: data.company_name,
      address: data.company_address,
      interns: data.interns,
    },
    preparedBy: "",
    certifiedBy: "",
  });

  return renderPdf(html);
}

export async function generateAnnexCPdf(reportId, accessToken) {
  const url = new URL(`${BACKEND_URL}/api/reports/annex-c/${reportId}`);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 403)
    throw new Error("Not authorized to export this report.");
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Backend returned ${res.status}`);

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
    preparedBy: data.prepared_by || "",
    certifiedBy: data.certified_by || "",
  });

  return renderPdf(html);
}

export async function generateStudentEvaluationPdf(evaluationId, accessToken) {
  const url = new URL(
    `${BACKEND_URL}/api/evaluations/student/${evaluationId}/print`,
  );

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 403) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error || "Not authorized to export this evaluation.");
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Backend returned ${res.status}`);

  const data = await res.json();

  const html = studentEvaluationHtml({
    hei: HEI_NAME,
    departmentName: data.department_name,
    studentName: data.student_name,
    companyName: data.company_name,
    categories: data.categories,
    remarks: data.other_remarks,
  });

  return renderPdf(html);
}
