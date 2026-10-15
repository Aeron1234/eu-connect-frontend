import { runPdfJob } from "../pdfBrowser.js";
import { BACKEND_URL, HEI_NAME, HEI_ADDRESS } from "./reportConfig.js";
import { annexDHtml } from "../pdfTemplates.js";

export async function generateAnnexDPdf(companyKey, academicYear, accessToken) {
  return runPdfJob(async ({ signal, renderPdf }) => {
    const url = new URL(`${BACKEND_URL}/api/reports/hte-annual/company`);
    url.searchParams.set("academicYear", academicYear);
    url.searchParams.set("companyKey", companyKey);

    const res = await fetch(url, {
      signal,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.status === 403)
      throw Object.assign(new Error("Not authorized to export this report."), { status: 403 });
    if (res.status === 404) return null;
    if (!res.ok) throw Object.assign(new Error(`Backend returned ${res.status}`), { status: res.status });

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
  });
}
