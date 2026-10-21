import { formatGender } from "../../../lib/formatGender.js";
import { header, escapeHtml, signatures } from "./sippTemplateShared.js";

function formatDuration(start, end) {
  const opts = { month: "long", day: "numeric" };
  const s = start ? new Date(start) : null;
  const startStr = s ? s.toLocaleDateString("en-US", opts) : "—";

  if (!end) {
    return `${startStr} – Present`;
  }

  const e = new Date(end);
  const endStr = e.toLocaleDateString("en-US", { ...opts, year: "numeric" });
  return `${startStr}-${endStr}`;
}

export function annexDHtml(data) {
  const c = data.company;

  const internRows = c.interns
    .map(
      (s, i) => `
      <tr>
        ${i === 0 ? `<td rowspan="${c.interns.length}" style="vertical-align: middle;">${escapeHtml(c.name)}</td>` : ""}
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.course)}</td>
        <td>${escapeHtml(formatGender(s.gender))}</td>
        <td>${escapeHtml(formatDuration(s.date_started, s.date_ended))}</td>
      </tr>`,
    )
    .join("") + Array.from({ length: Math.max(0, 7 - c.interns.length) }, () =>
      '<tr class="empty"><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>').join("");

  return `
    <!doctype html><html lang="en"><head><meta charset="utf-8" /><title>SIPP Annex D</title></head><body>
      ${header(
        "D",
        [
          "REPORT ON THE",
          "LIST HOST TRAINING ESTABLISHMENTS (HTEs) AND STUDENT INTERNS PARTICIPATING IN THE",
          "STUDENT INTERNSHIP PROGRAM IN THE PHILIPPINES (SIPP)",
        ],
        data.ay,
      )}
      <div class="meta">
        <div><strong>HEI:</strong> ${escapeHtml(data.hei)}</div>
        <div><strong>ADDRESS:</strong> ${escapeHtml(data.address)}</div>
      </div>
      <table class="report">
        <colgroup>
          <col style="width:22.0961%">
          <col style="width:21.6594%">
          <col style="width:22.3581%">
          <col style="width:13.8865%">
          <col style="width:19.9999%">
        </colgroup>
        <thead>
          <tr>
            <th>PARTNER HOST TRAINING ESTABLISHMENTS (HTEs)</th>
            <th>NAME OF STUDENT INTERNS</th>
            <th>PROGRAM</th>
            <th>GENDER</th>
            <th>DATES OF DURATION<br />OF THE INTERNSHIP</th>
          </tr>
        </thead>
        <tbody>${internRows}</tbody>
      </table>
      ${signatures(data.preparedBy, data.certifiedBy)}
      </td></tr></tbody></table>
    </body></html>
  `;
}
