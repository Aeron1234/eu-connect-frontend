import { LOGO_BASE64 } from "./pdfAssets";
import { formatGender } from "@/lib/formatGender";

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

const gradeScale = [
  { grade: 5, title: "Excellent", pct: "95-100" },
  { grade: 4, title: "Superior", pct: "90-94" },
  { grade: 3, title: "Very Good", pct: "85-89" },
  { grade: 2, title: "Good", pct: "80-84" },
  { grade: 1, title: "Fair", pct: "75-79" },
  { grade: 0, title: "Poor", pct: "74 below" },
  { grade: "N/A", title: "Not Applicable", pct: "" },
];

const letters = "abcdefghijklmnopqrstuvwxyz";

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function studentEvaluationHtml({
  hei = "MANUEL S. ENVERGA UNIVERSITY FOUNDATION - CANDELARIA, INC.",
  departmentName = "COMPUTER SCIENCE DEPARTMENT",
  // studentName / companyName / evaluatorName are intentionally accepted
  // (so callers don't need to change what they pass in) but are NOT
  // rendered. The printed form only shows grades; every identifying
  // field is left blank for the recipient to fill in by hand, same as
  // the original paper template.
  studentName, // eslint-disable-line no-unused-vars
  companyName, // eslint-disable-line no-unused-vars
  evaluatorName, // eslint-disable-line no-unused-vars
  createdAt,
  categories = [],
  remarks,
}) {
  const logo = LOGO_BASE64;
  const dateLabel = formatDate(createdAt);

  const remarksNumber = categories.length + 1;

  // The evaluation regularly spans 2+ printed pages, and each page should
  // repeat the letterhead (like the original paper form). Plain <div>
  // headers don't repeat across pages in Chromium's print engine, but a
  // <thead> on a <table> that itself breaks across pages does — so the
  // whole document body is wrapped in one table: the letterhead lives in
  // <thead> (repeats on every page) and the content is split into
  // separate <tr> rows in <tbody> (so the browser can break the page
  // between rows without ever splitting a row's content in half).
  const contentRows = [
    `<tr><td class="content-cell">
      <div class="date-row">
        <strong>Date:</strong> ${dateLabel || '<span class="blank-line" style="min-width:160px;"></span>'}
      </div>
 
      <div class="meta">
        <p><strong>Student:</strong> <span class="blank-line"></span></p>
        <p><strong>Company / HTE:</strong> <span class="blank-line"></span></p>
      </div>
 
      <p class="instruction">
        <strong>INSTRUCTION:</strong> Please give the <u>Numerical Grade</u> that corresponds to your evaluation on the space provided.
      </p>
 
      <table class="scale">
        <thead>
          <tr><th>Numerical Grade</th><th>Descriptive Title</th><th>Percentage</th></tr>
        </thead>
        <tbody>
          ${gradeScale
            .map(
              (g) =>
                `<tr><td>${g.grade}</td><td>${g.title}</td><td>${g.pct}</td></tr>`,
            )
            .join("")}
        </tbody>
      </table>
 
      <p class="evaluation-heading">EVALUATION</p>
    </td></tr>`,
    ...categories.map(
      (cat, i) => `<tr><td class="content-cell">
        <div class="section">
          <p class="section-title">${i + 1}. ${escapeHtml(String(cat.category ?? "").replace(/^\s*\d+\.\s*/, "")).toUpperCase()}</p>
          ${cat.items
            .map(
              (item, j) => `
            <div class="item-row">
              <span class="item-letter">${letters[j]}.</span>
              <span class="item-label">${escapeHtml(item.criterion_name)}</span>
              <span class="item-line">${item.score !== null && item.score !== undefined ? item.score : "&nbsp;"}</span>
            </div>`,
            )
            .join("")}
        </div>
      </td></tr>`,
    ),
    `<tr><td class="content-cell">
      <div class="remarks">
        <p class="remarks-title">${remarksNumber}. OTHER REMARKS:</p>
        <div class="remarks-line">${remarks ? escapeHtml(remarks) : ""}</div>
        <div class="remarks-line"></div>
      </div>
 
      <p class="sign-heading">Evaluated by:</p>
      <div class="sign">
        <div class="sign-block">
          <div class="sign-line"></div>
          <p class="sign-label">Student Being Evaluated</p>
        </div>
        <div class="sign-block">
          <div class="sign-line"></div>
        </div>
      </div>
    </td></tr>`,
  ].join("");

  return `
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      @page { size: A4; margin: 30px 45px; }
      body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #1c1917; }
 
      /* Repeating-header table: thead re-prints at the top of every
         printed page; each tbody row is an unbreakable content chunk. */
      table.doc { width: 100%; border-collapse: collapse; table-layout: fixed; }
      table.doc > thead { display: table-header-group; }
      table.doc td.header-cell { padding: 0 0 16px 0; }
      table.doc td.content-cell { padding: 0; page-break-inside: avoid; break-inside: avoid; }
 
      .header { display: flex; align-items: center; gap: 14px; margin-bottom: 4px; }
      .header img.logo { width: 60px; height: 60px; flex-shrink: 0; }
      .header-text { flex: 1; }
      .header-text .uni-name {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 15px;
        font-weight: bold;
        color: #7f1d1d;
        letter-spacing: 0.3px;
        margin: 0 0 2px 0;
        border-bottom: 1.5px solid #7f1d1d;
        display: inline-block;
        padding-bottom: 1px;
      }
      .header-text .dept-name {
        font-size: 11.5px;
        margin: 3px 0 0 0;
        letter-spacing: 0.5px;
      }
      .header-rule { border: none; border-top: 2px solid #7f1d1d; margin: 4px 0 16px 0; }
 
      .date-row { text-align: right; margin-bottom: 16px; font-size: 11px; }
 
      .meta { margin-bottom: 14px; }
      .meta p { margin: 3px 0; }
      .blank-line {
        display: inline-block;
        min-width: 320px;
        border-bottom: 1px solid #1c1917;
        height: 12px;
      }
 
      .instruction { font-size: 10.5px; margin-bottom: 10px; }
 
      table.scale { border-collapse: collapse; width: 60%; margin-bottom: 18px; font-size: 10.5px; }
      table.scale th, table.scale td { border: 1px solid #1c1917; padding: 3px 10px; text-align: center; }
      table.scale th { background: #f5f5f4; }
 
      .evaluation-heading { text-align: center; font-weight: bold; font-size: 13px; margin: 14px 0; }
 
      .section { margin-bottom: 10px; page-break-inside: avoid; }
      .section-title { font-weight: bold; font-size: 11px; margin-bottom: 4px; }
      .item-row { display: flex; align-items: baseline; gap: 6px; margin: 2px 0 2px 14px; }
      .item-letter { width: 14px; flex-shrink: 0; }
      .item-label { flex-shrink: 0; }
      .item-line {
        flex: 1;
        text-align: right;
        border-bottom: 1px dotted #1c1917;
        margin: 0 4px 0 6px;
        padding-right: 6px;
        font-weight: bold;
      }
 
      .remarks { margin-top: 16px; }
      .remarks-title { font-weight: bold; margin-bottom: 4px; }
      .remarks-line { border-bottom: 1px solid #1c1917; height: 16px; margin-top: 4px; }
 
      .sign-heading { text-align: right; font-weight: bold; margin-top: 50px; margin-bottom: 30px; }
      .sign { display: flex; justify-content: space-between; gap: 40px; }
      .sign-block { text-align: center; flex: 1; }
      .sign-line { border-bottom: 1px solid #1c1917; height: 30px; }
      .sign-label { font-size: 10px; margin-top: 4px; }
    </style>
  </head>
  <body>
    <table class="doc">
      <thead>
        <tr>
          <td class="header-cell">
            <div class="header">
              ${logo ? `<img class="logo" src="${logo}" alt="logo" />` : ""}
              <div class="header-text">
                <p class="uni-name">${escapeHtml(hei)}</p>
                <p class="dept-name">${escapeHtml(departmentName)}</p>
              </div>
            </div>
            <hr class="header-rule" />
          </td>
        </tr>
      </thead>
      <tbody>
        ${contentRows}
      </tbody>
    </table>
  </body>
  </html>
  `;
}
