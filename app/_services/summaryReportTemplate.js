import { escapeHtml, journalStyles, proseParagraphs } from "./templates/printDocumentShared.js";

const sections = [
  ["organization_experience", "Working in the Organization/Company"],
  ["work_schedule", "Work Schedule"],
  ["memorable_moment", "Most Memorable Practicum Moment"],
  ["difficulties_solutions", "Difficulties Encountered and Solutions Made"],
];

export function summaryReportHtml(report, imageDataUrls = []) {
  const bodySections = sections.map(([key, label]) => `
    <section><h2>${label}</h2>${proseParagraphs(report[key])}</section>`).join("");
  const images = (Array.isArray(imageDataUrls) ? imageDataUrls : [imageDataUrls]).filter(Boolean)
    .map((url) => `<figure><img src="${escapeHtml(url)}" alt="Internship memorabilia" /></figure>`).join("");
  // The legacy supplemental file is referenced, not embedded into the PDF. Memorabilia
  // images are supplied separately as data URLs in their saved order.
  const attachmentText = report.attachment_name
    ? `<p class="attachment">A supplemental file is available with the digital report.</p>` : "";

  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><title>Summary Report</title>
  <style>
    ${journalStyles}
    .images { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6mm; margin-top: 10px; }
    figure { break-inside: avoid; }
    img { display: block; max-width: 60mm; max-height: 35mm; width: auto; height: auto; object-fit: contain; }
    .attachment { margin-top: 8px; }
  </style></head><body>
    <h1>Summary Report</h1>
    <div class="details"><p><strong>Name:</strong> ${escapeHtml(report.student_name || "Student")}</p>
    <p><strong>Company:</strong> ${escapeHtml(report.company_name)}</p></div>
    ${bodySections}
    <section><h2>Picture or Multimedia Memorabilia</h2>
      ${report.memorabilia_note ? proseParagraphs(report.memorabilia_note) : ""}
      ${images ? `<div class="images">${images}</div>` : ""}${attachmentText}
    </section>
  </body></html>`;
}
