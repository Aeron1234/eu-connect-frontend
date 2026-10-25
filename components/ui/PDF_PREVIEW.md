# PDF preview

`PdfPreviewProvider` supplies one shared React-PDF viewer. Report exports and authorized stored PDF actions call `usePdfPreview().previewPdf({ filename, load(signal) })` instead of downloading immediately. `load` returns a successful PDF `Response`, or a JSON error response with its original status and code.

The modal opens during preparation, supports retry, and cancels pending reads when closed or on pathname changes. Blob URLs and private document state are released on close. Download uses the original PDF bytes. Print renders every page from the loaded PDF at up to 144 dpi, retaining each page's size and orientation; it does not make another export request. Non-PDF documents use the same provider through previewDocument (see below).

PDF.js worker, fonts, character maps, color profiles, and WebAssembly files are served locally from `public/pdfjs/<installed-version>/`. `scripts/prepare-pdf-preview.mjs` generates these ignored assets during install and before development/production builds. If install scripts are disabled, run `npm run prepare:pdf-preview` before starting the app. No API key, environment variable, backend change, or external viewer service is required.

Preview tests: `node --test tests/pdf-preview.test.mjs tests/pdf-download.test.mjs tests/student-storage-download.test.mjs`.

## Office, text and image files

The provider previewDocument API takes filename, mimeType, load(signal), and downloadOriginal(signal). DOCX uses docx-preview, XLS/XLSX/CSV use SheetJS CE in a worker, and text/images use native browser rendering. All render inside an offline sandboxed iframe and offer an explicit original-byte download. Legacy .doc and parse errors keep Download original file available.

Non-PDF printing uses react-to-print on only the rendered document root, never the page or toolbar. Word prints all pages; spreadsheets print the selected sheet. Preview starts at 75% without scaling the print. Limits are visible; partial spreadsheet/text previews disable printing so missing content cannot be silently omitted.

Install with npm ci; .npmrc sets allow-remote=root for the pinned official SheetJS tarball. Libraries are bundled locally, not fetched at preview time. No server conversion service/API key is used. Browser Office rendering may differ from Microsoft Office, including charts, formulas, and exact pagination. Downloading preserves the original document.

Verification: node --test tests/office-preview.test.mjs tests/student-storage-download.test.mjs tests/pdf-preview.test.mjs tests/pdf-download.test.mjs.
