import { printFontCss } from "./printDocumentShared.js";

// Evaluation.docx: A4, one-inch margins, 12 pt body, single spacing.
export const studentEvaluationStyles = `<style>
  ${printFontCss}
  @page { size: A4 portrait; margin: 1in; }
  html, body { margin: 0; padding: 0; }
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1; color: #000; }
  p { margin: 0; }
  table.doc { width: 100%; border-collapse: collapse; table-layout: fixed; }
  table.doc > thead { display: table-header-group; }
  .header-cell { padding: 0 0 24pt; }
  .content-cell { padding: 0; vertical-align: top; }
  /* The seal must occupy normal layout space inside the repeating header,
     rather than extending left of its printable table cell. */
  .header { display: flex; align-items: center; gap: 12pt; width: 100%; break-inside: avoid; }
  .header img.logo { display: block; flex: 0 0 56pt; width: 56pt; height: 56pt; object-fit: contain; }
  .header-text { flex: 1; min-width: 0; }
  .uni-name { font-size: 12pt; line-height: 1.15; font-weight: normal; color: #710000; border-bottom: .75pt solid #cc0000; padding-bottom: 2pt; overflow-wrap: break-word; }
  .dept-name { font-size: 11pt; text-align: right; margin-top: 16pt; }
  .cover-row { break-after: page; }
  .date-block { width: 2.2in; margin: 12pt 0 0 auto; text-align: center; }
  .blank-line { display: inline-block; border-bottom: .5pt solid #000; min-width: 2.5in; height: 12pt; }
  .date-block .blank-line { min-width: 2in; }
  .recipient { margin-top: 12pt; }
  .recipient p { height: 12pt; }
  .salutation { margin-top: 24pt; }
  .letter-body { margin-top: 24pt; }
  .letter-body p { margin-bottom: 12pt; text-align: justify; }
  .letter-body ol { margin: 0 0 12pt; padding-left: 1in; }
  .letter-body li { padding-left: .25in; }
  .letter-body .indented { text-indent: .5in; }
  .head-signature { margin-top: 24pt; }
  .head-signature .blank-line { min-width: 2.5in; }
  .head-signature p { margin-top: 4pt; }
  .instruction { margin-bottom: 12pt; }
  .instruction strong { display: block; margin-bottom: 0; }
  .scale { width: 100%; border-collapse: collapse; table-layout: fixed; margin: 12pt 0; }
  .scale th, .scale td { border: .5pt solid #000; padding: 0 5.4pt; font-size: 12pt; line-height: 1; text-align: center; }
  .scale th { height: 36pt; vertical-align: middle; }
  .scale td:nth-child(2) { text-align: left; padding-left: 16pt; }
  .evaluation-heading { text-align: left; font-weight: bold; margin: 12pt 0 0; }
  .section-title { font-size: 12pt; font-weight: bold; margin: 0; break-after: avoid; }
  .section { margin-bottom: 12pt; }
  .item-row { display: flex; align-items: baseline; min-height: 12pt; break-inside: avoid; }
  .item-letter { flex: 0 0 14pt; }
  .item-label { flex: 0 1 auto; overflow-wrap: anywhere; }
  .item-line { flex: 1 0 36pt; min-width: 36pt; border-bottom: .5pt solid #000; text-align: right; margin-left: 4pt; padding-right: 6pt; }
  .remarks { margin-top: 0; break-inside: avoid; }
  .remarks-title { font-size: 12pt; font-weight: bold; }
  .remarks-text { white-space: pre-wrap; overflow-wrap: anywhere; border-bottom: .5pt solid #000; min-height: 12pt; }
  .remarks-line { height: 12pt; border-bottom: .5pt solid #000; }
  .sign { margin-top: 24pt; break-inside: avoid; }
  .sign-heading { text-align: right; margin-bottom: 24pt; }
  .sign-line { width: 4in; border-bottom: .5pt solid #000; height: 12pt; }
  .sign-label { width: 4in; text-align: center; margin-top: 0; }
</style>`;
