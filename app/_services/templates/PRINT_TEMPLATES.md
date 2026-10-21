# School printable templates

The layouts are based on the four Word files supplied on October 22, 2026.
Measurements were read from their WordprocessingML, including section sizes,
paragraph properties, run sizes, table grids, header drawings and colors.

| Reference | Printable layout |
| --- | --- |
| Narrative.docx | Practicum Journal; A4 portrait, 1 cm margins, Times New Roman 12 pt body / 13 pt bold title, 1.5 spacing, 1 cm first-line indent. Each saved week starts a separate journal. |
| Summary Report (1).docx | Same page geometry and typography; original section wording, bold labels, left-aligned title and indented paragraphs. Existing memorabilia images and attachment notice remain supported. |
| Evaluation (1).docx | A4 portrait, 1 inch margins, single-spaced 12 pt body, request letter, repeating school letterhead, grading scale, categories, solid answer lines, remarks and signature area. Times New Roman is used throughout, as requested, including runs that were Arial in the source. |
| registrar-hteforms-template.docx | Annex C and Annex D; legal landscape (14 x 8.5 inches), 1 inch side margins / 1 cm top and bottom, 13 pt school name, 12 pt titles and metadata, 11 pt tables and signatures. Original column proportions, school seal and maroon #710000 are retained. |

`printFontAssets.js` embeds regular and bold Times New Roman so production
Chromium does not silently substitute a different serif font. The font files'
embedding flags permit editable document embedding. No external font service,
runtime Windows font dependency, environment variable or database change is
needed. `printTemplateAssets.js` contains the two school seals extracted from
the reference documents.

Record values replace sample names in journal/summary and registrar reports.
Evaluation date, recipient and signature blanks follow the paper form; the
sample department head is not hardcoded. Narrative date ranges remain blank
because the application stores a week number and submission time, not a daily
attendance range. Submission dates must not be presented as attendance dates.

Existing authorization, confidential evaluation access, download filenames,
PDF runtime limits and the summary report's three-page limit are unchanged.
The exporters explicitly honor CSS paper sizes; evaluation is portrait rather
than inheriting the runtime's landscape default.

Validation: frontend test suite (238 checks) and targeted ESLint passed.
Local visual/PDF preview verification could not finish: cached Chromium exits
with Windows access denied, and the browser tool rejects local file URLs.
Consequently exact pagination and visual equality to Word remain unverified.
