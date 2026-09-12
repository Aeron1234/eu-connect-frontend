import { getBrowser } from "./pdfBrowser";
import { annexCHtml, annexDHtml } from "./pdfTemplates";

const HEI_NAME = "Manuel S. Enverga University Foundation-Candelaria, Inc.";
const HEI_ADDRESS = "Malabanban Norte, Candelaria, Quezon";
const BACKEND_URL = process.env.API_BASE_URL;

async function renderPdf(html) {
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    return await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
    });
  } finally {
    await browser.close();
  }
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
