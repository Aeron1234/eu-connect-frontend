import { header, escapeHtml, signatures } from "./sippTemplateShared.js";

export function annexCHtml(data) {
  // Render exactly the supplied saved rows. Do not add blank template rows or impose
  // a fixed row count; table pagination follows actual content.
  const entries = data.rows.map((r) => `<tr><td>${escapeHtml(r.issues)}</td><td>${escapeHtml(r.solutions)}</td><td>${escapeHtml(r.recommendations)}</td></tr>`);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><title>SIPP Annex C</title></head><body>
    ${header("C", ["ANNUAL REPORT IN THE", "IMPLEMENTATION OF STUDENT INTERNSHIP PROGRAM IN THE PHILIPPINES (SIPP)"], data.ay)}
    <div class="meta"><p><strong>HEI:</strong> ${escapeHtml(data.hei)}</p><p><strong>ADDRESS:</strong> ${escapeHtml(data.address)}</p><p><strong>DEGREE PROGRAM:</strong> ${escapeHtml(data.degreeProgram)}</p></div>
    <table class="report"><colgroup><col style="width:33.3333%" /><col style="width:33.3333%" /><col style="width:33.3333%" /></colgroup>
      <thead><tr><th>ISSUES and CONCERNS ENCOUNTERED</th><th>SOLUTIONS</th><th>RECOMMENDATIONS</th></tr></thead><tbody>${entries.join("")}</tbody>
    </table>${signatures(data.preparedBy, data.certifiedBy)}
    </td></tr></tbody></table>
  </body></html>`;
}
