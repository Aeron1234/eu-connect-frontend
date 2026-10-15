import { LOGO_BASE64 } from "../pdfAssets.js";
import { escapeHtml } from "./sippTemplateShared.js";
import { studentEvaluationStyles } from "./studentEvaluationStyles.js";

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
    ${studentEvaluationStyles}
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
