import { registrarSeal } from "./printTemplateAssets.js";
import { printFontCss, escapeHtml } from "./printDocumentShared.js";

export { escapeHtml };

// Registrar reference: 14 x 8.5 inches (legal landscape), 1-inch side
// margins and 1-cm top/bottom margins. Defaults are 11 pt; titles/meta 12 pt.
const baseStyles = `<style>
  ${printFontCss}
  @page { size: 14in 8.5in; margin: 1cm 1in; }
  html, body { margin: 0; padding: 0; }
  body { font-family: "Times New Roman", Times, serif; font-size: 11pt; line-height: 1.15; color: #000; }
  p { margin: 0; }
  table.document { width: 100%; border-collapse: collapse; table-layout: fixed; }
  table.document > thead { display: table-header-group; }
  table.document > thead > tr > td, table.document > tbody > tr > td { padding: 0; border: 0; vertical-align: top; }
  .header { position: relative; text-align: center; height: 58pt; padding-top: 0; }
  .header img { position: absolute; left: 2in; top: -7pt; width: 55.125pt; height: 55.924pt; }
  .org-name { color: #710000; font-weight: bold; font-size: 13pt; }
  .org-sub { color: #710000; font-size: 12pt; line-height: 1; }
  .hr { border-top: 1.5pt solid #710000; width: 6.51in; margin: 12pt auto 0; }
  .annex-tag { text-align: left; font-size: 11pt; line-height: 1.15; }
  .title { text-align: center; font-weight: bold; font-size: 12pt; line-height: 1.15; }
  .meta { margin: 12.65pt 0; font-size: 12pt; line-height: 1.15; }
  .report { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .report th, .report td { border: 1pt solid #000; padding: 5pt; vertical-align: top; font-size: 11pt; line-height: 1; overflow-wrap: anywhere; white-space: pre-wrap; }
  .report th { text-align: left; font-weight: bold; }
  .report thead { display: table-header-group; }
  .report tr { break-inside: avoid; }
  .report .empty td { height: 11pt; }
  .sign-block { display: flex; justify-content: space-between; gap: 1in; margin-top: 12.65pt; break-inside: avoid; }
  .sign-block > div { width: 45%; }
  .sign-line { border-bottom: .5pt solid #000; min-height: 12.65pt; margin-top: 12.65pt; }
  .sign-caption { font-size: 11pt; }
</style>`;

export function header(annexLabel, titleLines, ay) {
  return `${baseStyles}
    <table class="document"><thead><tr><td>
      <div class="header"><img src="${registrarSeal}" alt="School seal" />
        <p class="org-name">MANUEL S. ENVERGA UNIVERSITY FOUNDATION - CANDELARIA, INC.</p>
        <p class="org-sub">Quezon, Philippines</p><div class="hr"></div>
      </div>
    </td></tr></thead><tbody><tr><td>
    <div class="annex-tag">Annex &ldquo;${escapeHtml(annexLabel)}&rdquo;</div>
    <div class="title">${titleLines.map(escapeHtml).join("<br />")}<br />AY ${escapeHtml(ay)}</div>`;
}

export function signatures(preparedBy, certifiedBy) {
  return `<div class="sign-block">
    <div><strong>PREPARED BY:</strong><div class="sign-line">${escapeHtml(preparedBy)}</div><p class="sign-caption">Name &amp; Signature</p></div>
    <div><strong>CERTIFIED CORRECT:</strong><div class="sign-line">${escapeHtml(certifiedBy)}</div><p class="sign-caption">Name &amp; Signature</p></div>
  </div>`;
}
