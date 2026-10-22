import { LOGO_BASE64 } from "../pdfAssets.js";
import { escapeHtml } from "./printDocumentShared.js";
import { studentEvaluationStyles } from "./studentEvaluationStyles.js";

const gradeScale = [
  [5, "Excellent", "95-100"], [4, "Superior", "90-94"],
  [3, "Very Good", "85-89"], [2, "Good", "80-84"],
  [1, "Fair", "75-79"], [0, "Poor", "74 below"],
  ["N/A", "Not Applicable", ""],
];

export function studentEvaluationHtml({
  hei = "MANUEL S. ENVERGA UNIVERSITY FOUNDATION - CANDELARIA, INC.",
  departmentName = "COMPUTER SCIENCE DEPARTMENT",
  categories = [], remarks,
}) {
  // As in the supplied paper form, date/recipient/signatures stay blank.
  // Never print the sample person's name or a fabricated department head.
  const contentRows = [
    `<tr class="cover-row"><td class="content-cell"><div class="cover">
      <div class="date-block"><span class="blank-line"></span><p>Date</p></div>
      <div class="recipient"><p><span class="blank-line"></span></p><p><span class="blank-line"></span></p><p><span class="blank-line"></span></p></div>
      <p class="salutation">Dear ________________________:</p>
      <div class="letter-body">
        <p>We appreciate very much your valuable assistance in developing the potentials of our students,</p>
        <p>As part of our assessment, may we request you to fill up the attached trainee evaluation for us to discover:</p>
        <ol><li>What have our students attained so far?</li><li>What are the strong and weak areas our students have?</li><li>What general perception from their employers can be derived?</li></ol>
        <p class="indented">It is hoped that through this way we will be able to come up with a more rational student apprenticeship program.</p>
        <p class="indented">Thank you very much.</p>
      </div>
      <div class="head-signature"><span class="blank-line"></span><p>${escapeHtml(departmentName)} Head</p></div>
    </div></td></tr>`,
    `<tr><td class="content-cell">
      <div class="instruction"><strong>INSTRUCTION:</strong>Please give the <b><u>Numerical Grade</u></b> that corresponds to your evaluation on the space provided.</div>
      <table class="scale"><thead><tr><th>NUMERICAL GRADE</th><th>DESCRIPTIVE TITLE</th><th>PERCENTAGE</th></tr></thead>
      <tbody>${gradeScale.map(([grade, title, pct]) => `<tr><td>${grade}</td><td>${title}</td><td>${pct || "&nbsp;"}</td></tr>`).join("")}</tbody></table>
      <p class="evaluation-heading">EVALUATION</p>
    </td></tr>`,
    ...categories.map((cat, i) => `<tr><td class="content-cell"><div class="section">
      <p class="section-title">${i + 1}. ${escapeHtml(String(cat.category ?? "").replace(/^\s*\d+\.\s*/, "")).toUpperCase()}</p>
      ${cat.items.map((item, j) => `<div class="item-row"><span class="item-letter">${String.fromCharCode(97 + j)}.</span><span class="item-label">${escapeHtml(item.criterion_name)}</span><span class="item-line">${item.score === null || item.score === undefined ? "&nbsp;" : escapeHtml(item.score)}</span></div>`).join("")}
    </div></td></tr>`),
    `<tr><td class="content-cell"><div class="remarks"><p class="remarks-title">${categories.length + 1}. OTHER REMARKS:</p>
      <div class="remarks-text">${escapeHtml(remarks)}</div><div class="remarks-line"></div><div class="remarks-line"></div><div class="remarks-line"></div></div>
      <div class="sign"><p class="sign-heading">Evaluated by:</p><div class="sign-line"></div><p class="sign-label">Student Being Evaluated</p></div>
    </td></tr>`,
  ].join("");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><title>Student Evaluation</title>${studentEvaluationStyles}</head><body>
    <table class="doc"><thead><tr><td class="header-cell"><div class="header">
      <img class="logo" src="${LOGO_BASE64}" alt="School seal" />
      <div class="header-text">
        <p class="uni-name">${escapeHtml(hei)}</p><p class="dept-name">${escapeHtml(departmentName)}</p>
      </div>
    </div></td></tr></thead><tbody>${contentRows}</tbody></table>
  </body></html>`;
}
