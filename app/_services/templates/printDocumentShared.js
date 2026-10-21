import { printFontCss } from "./printFontAssets.js";

export { printFontCss };

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Word: 24 half-points = 12 pt; line=360/240 = 1.5;
// margins and first-line indent=566.929 twips = 1 cm.
export const journalStyles = `
  ${printFontCss}
  @page { size: A4 portrait; margin: 1cm; }
  html, body { margin: 0; padding: 0; }
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.5; color: #000; }
  h1, h2, p, figure { margin: 0; padding: 0; }
  h1 { text-align: left; font-size: 13pt; line-height: 1.5; font-weight: bold; margin-bottom: 18pt; }
  h2 { font-size: 12pt; font-weight: bold; line-height: 1.5; break-after: avoid; }
  .details { margin-bottom: 18pt; break-inside: avoid; }
  .prose { white-space: pre-wrap; overflow-wrap: anywhere; text-indent: 1cm; orphans: 2; widows: 2; }
  section { margin-bottom: 18pt; }
`;

export function proseParagraphs(value) {
  return String(value ?? "").split(/\r?\n/)
    .map((line) => `<p class="prose">${line ? escapeHtml(line) : "<br />"}</p>`).join("");
}
