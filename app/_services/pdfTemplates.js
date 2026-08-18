import { LOGO_BASE64 } from "./pdfAssets";

const baseStyles = `
  <style>
    @page { size: A4 landscape; margin: 18mm 20mm; }
    body { font-family: "Times New Roman", Times, serif; font-size: 11px; color: #000; }
    .header { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 4px; }
    .header img { height: 60px; width: auto; }
    .header-text { text-align: center; }
    .org-name { color: #a30000; font-weight: bold; font-size: 16px; }
    .org-sub { color: #a30000; font-size: 12px; }
    .hr { border-top: 2px solid #a30000; margin: 6px 0 4px; }
    .annex-tag { text-align: right; font-style: italic; margin-bottom: 10px; font-size: 12px; }
    .title { text-align: center; font-weight: bold; font-size: 12px; line-height: 1.5; }
    .meta { margin: 16px 0; font-size: 11px; }
    .meta div { margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 14px; table-layout: fixed; }
    th, td { border: 1px solid #000; padding: 8px 10px; vertical-align: top; font-size: 11px; word-wrap: break-word; }
    th { text-align: center; font-weight: bold; }
    .sign-block { display: flex; justify-content: space-between; margin-top: 50px; }
    .sign-line { border-top: 1px solid #000; width: 280px; padding-top: 2px; }
  </style>
`;

function header(annexLabel, titleLines, ay) {
  return `
    ${baseStyles}
    <div class="header">
      <img src="${LOGO_BASE64}" alt="Seal" />
      <div class="header-text">
        <span class="org-name">MANUEL S. ENVERGA UNIVERSITY FOUNDATION - CANDELARIA, INC.</span><br/>
        <span class="org-sub">Quezon, Philippines</span>
      </div>
    </div>
    <div class="hr"></div>
    <div class="annex-tag">Annex "${annexLabel}"</div>
    <div class="title">
      ${titleLines.join("<br/>")}<br/>
      AY ${ay}
    </div>
  `;
}

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
        <td>${escapeHtml(s.gender || "—")}</td>
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

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
