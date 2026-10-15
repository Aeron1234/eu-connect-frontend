import { header, escapeHtml } from "./sippTemplateShared.js";

export function annexCHtml(data) {
  const rows = data.rows
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(r.issues)}</td>
        <td>${escapeHtml(r.solutions)}</td>
        <td>${escapeHtml(r.recommendations)}</td>
      </tr>`,
    )
    .join("");

  return `
    <html><body>
      ${header(
        "C",
        [
          "ANNUAL REPORT IN THE",
          "IMPLEMENTATION OF STUDENT INTERNSHIP PROGRAM IN THE PHILIPPINES (SIPP)",
        ],
        data.ay,
      )}
      <div class="meta">
        <div><strong>HEI:</strong> ${escapeHtml(data.hei)}</div>
        <div><strong>ADDRESS:</strong> ${escapeHtml(data.address)}</div>
        <div><strong>DEGREE PROGRAM:</strong> ${escapeHtml(data.degreeProgram)}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:33%">ISSUES and CONCERNS ENCOUNTERED</th>
            <th style="width:33%">SOLUTIONS</th>
            <th style="width:34%">RECOMMENDATIONS</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
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
