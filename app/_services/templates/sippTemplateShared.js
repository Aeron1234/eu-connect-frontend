import { LOGO_BASE64 } from "../pdfAssets.js";

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

export function header(annexLabel, titleLines, ay) {
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

export function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
