function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function weeklyNarrativesHtml(record) {
  const entries = record.narratives.map((item) => `
    <article>
      <h2>Week ${escapeHtml(item.week_number)} — ${escapeHtml(item.title)}</h2>
      <p>${escapeHtml(item.narrative)}</p>
    </article>`).join("");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8" />
    <title>Weekly Narratives</title><style>
      @page { size: A4 portrait; margin: 1in; }
      html, body { margin: 0; padding: 0; }
      body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.5; color: #000; }
      h1 { text-align: center; font-size: 14pt; margin: 0 0 18px; }
      .details { margin: 0 0 24px; }
      article { margin-bottom: 24px; }
      h2 { font-size: 12pt; margin: 0 0 8px; break-after: avoid; }
      article p { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
    </style></head><body>
      <h1>Weekly Narratives</h1>
      <p class="details"><strong>Name:</strong> ${escapeHtml(record.student_name || "Student")}<br />
      <strong>Company:</strong> ${escapeHtml(record.company_name)}</p>
      ${entries}
    </body></html>`;
}
