import { formatGender } from "../../../lib/formatGender.js";
import { formatAnnexDDuration } from "../../../lib/annex-d-dates.mjs";
import { header, escapeHtml, signatures } from "./sippTemplateShared.js";

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
        <td>${escapeHtml(formatAnnexDDuration(s.date_started, s.date_ended))}</td>
      </tr>`,
    )
    .join("");

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
