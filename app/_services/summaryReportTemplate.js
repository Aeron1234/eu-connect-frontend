function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const sections = [
  ["organization_experience", "Working in the organization / company"],
  ["work_schedule", "Work schedule"],
  ["memorable_moment", "Most memorable practicum moment"],
  ["difficulties_solutions", "Difficulties encountered and solutions made"],
];

export function summaryReportHtml(report, imageDataUrls = []) {
  const bodySections = sections.map(([key, label]) => `
    <section>
      <h2>${label}</h2>
      <p>${escapeHtml(report[key])}</p>
    </section>`).join("");
  const images = (Array.isArray(imageDataUrls) ? imageDataUrls : [imageDataUrls]).filter(Boolean)
    .map((url) => `<figure><img src="${url}" alt="Internship memorabilia" /></figure>`).join("");
  const attachmentText = report.attachment_name
    ? `<p class="attachment">A supplemental file is available with the digital report.</p>`
    : "";

  return `<!doctype html>
  <html lang="en"><head><meta charset="utf-8" /><title>Summary Report</title>
  <style>
    @page { size: A4 portrait; margin: 1in; }
    html, body { margin: 0; padding: 0; }
    body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.5; color: #000; }
    h1, h2, p, figure { margin: 0; }
    h1 { text-align: center; font-size: 12pt; font-weight: bold; margin-bottom: 20px; }
    .details { margin-bottom: 18px; }
    section { margin-bottom: 18px; }
    h2 { font-size: 12pt; font-weight: bold; break-after: avoid; }
    p { white-space: pre-wrap; overflow-wrap: anywhere; }
    .images { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6mm; margin-top: 10px; }
    figure { break-inside: avoid; }
    img { display: block; max-width: 60mm; max-height: 35mm; width: auto; height: auto; object-fit: contain; }
    .attachment { margin-top: 8px; }
  </style></head><body>
    <h1>Summary Report</h1>
    <p class="details"><strong>Name:</strong> ${escapeHtml(report.student_name || "Student")}<br /><strong>Company:</strong> ${escapeHtml(report.company_name)}</p>
    ${bodySections}
    <section><h2>Picture or multimedia memorabilia</h2>
      ${report.memorabilia_note ? `<p>${escapeHtml(report.memorabilia_note)}</p>` : ""}
      ${images ? `<div class="images">${images}</div>` : ""}${attachmentText}
    </section>
  </body></html>`;
}
