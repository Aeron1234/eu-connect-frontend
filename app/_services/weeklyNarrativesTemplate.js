import { rotationSnapshots } from "../../lib/internship-rotations.mjs";
import { escapeHtml, journalStyles, proseParagraphs } from "./templates/printDocumentShared.js";
import { formatNarrativeRange } from "../../lib/weekly-narrative-dates.mjs";

export function weeklyNarrativesHtml(record) {
  const entries = record.narratives.map((item) => `
    <article aria-label="Week ${escapeHtml(item.week_number)}">
      <h1>Practicum Journal</h1>
      <div class="details">
        <p><strong>Name:</strong> ${escapeHtml(record.student_name || "Student")}</p>
        <p><strong>Company:</strong> ${escapeHtml(record.company_name)}</p>
        <p><strong>Week:</strong> ${escapeHtml(item.week_number)}${item.title ? ` &mdash; ${escapeHtml(item.title)}` : ""}</p>
        <p><strong>Date:</strong> ${escapeHtml(formatNarrativeRange(item.date_from, item.date_to) || "___ to ___")}</p>
        ${rotationSnapshots(item.rotation_assignments).length ? `<p><strong>Company department(s):</strong> ${rotationSnapshots(item.rotation_assignments).map(row => escapeHtml(row.department_name) + (row.supervisor_name ? " (Supervisor: " + escapeHtml(row.supervisor_name) + ")" : "")).join("; ")}</p>` : ""}
      </div>
      ${proseParagraphs(item.narrative)}
    </article>`).join("");

  // Legacy entries without coverage dates keep the paper form's blank field;
  // submission time must never stand in for the dates actually covered.
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" />
    <title>Practicum Journal</title><style>
      ${journalStyles}
      article + article { break-before: page; }
    </style></head><body>${entries}</body></html>`;
}
