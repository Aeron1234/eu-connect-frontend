import { escapeHtml, journalStyles, proseParagraphs } from "./templates/printDocumentShared.js";

export function weeklyNarrativesHtml(record) {
  const entries = record.narratives.map((item) => `
    <article aria-label="Week ${escapeHtml(item.week_number)}">
      <h1>Practicum Journal</h1>
      <div class="details">
        <p><strong>Name:</strong> ${escapeHtml(record.student_name || "Student")}</p>
        <p><strong>Company:</strong> ${escapeHtml(record.company_name)}</p>
        <p><strong>Week:</strong> ${escapeHtml(item.week_number)}${item.title ? ` &mdash; ${escapeHtml(item.title)}` : ""}</p>
        <p><strong>Date:</strong> ___ to ___</p>
      </div>
      ${proseParagraphs(item.narrative)}
    </article>`).join("");

  // No date range is stored for a narrative. Keep the paper form's blank
  // field instead of presenting its submission date as attendance dates.
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" />
    <title>Practicum Journal</title><style>
      ${journalStyles}
      article + article { break-before: page; }
    </style></head><body>${entries}</body></html>`;
}
