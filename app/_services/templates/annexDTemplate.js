import { formatGender } from "@/lib/formatGender";
import { header, escapeHtml } from "./sippTemplateShared.js";

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
        <td>${i + 1}. ${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.course)}</td>
        <td>${escapeHtml(formatGender(s.gender))}</td>
        <td>${escapeHtml(formatDuration(s.date_started, s.date_ended))}</td>
      </tr>`,
    )
    .join("");

  return `
    <html><body>
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
      <table>
        <colgroup>
          <col style="width:20%">
          <col style="width:24%">
          <col style="width:26%">
          <col style="width:10%">
          <col style="width:20%">
        </colgroup>
        <thead>
          <tr>
            <th>PARTNER HOST TRAINING ESTABLISHMENTS (HTEs)</th>
            <th>NAME OF STUDENT INTERNS</th>
            <th>PROGRAM</th>
            <th>GENDER</th>
            <th>DATES OF DURATION OF THE INTERNSHIP</th>
          </tr>
        </thead>
        <tbody>${internRows}</tbody>
      </table>
      <div class="sign-block">
        <div>
          <strong>PREPARED BY:</strong><br/><br/><br/>
          <div class="sign-line">${escapeHtml(data.preparedBy)}<br/><span style="font-size:10px">Name &amp; Signature</span></div>
        </div>
        <div>
          <strong>CERTIFIED CORRECT:</strong><br/><br/><br/>
          <div class="sign-line">${escapeHtml(data.certifiedBy)}<br/><span style="font-size:10px">Name &amp; Signature</span></div>
        </div>
      </div>
    </body></html>
  `;
}
