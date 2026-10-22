# PDF preview

`PdfPreviewProvider` supplies one shared React-PDF viewer. Report exports and authorized stored PDF actions call `usePdfPreview().previewPdf({ filename, load(signal) })` instead of downloading immediately. `load` returns a successful PDF `Response`, or a JSON error response with its original status and code.

The modal opens during preparation, supports retry, and cancels pending reads when closed or on pathname changes. Blob URLs and private document state are released on close. Download uses the original PDF bytes. Print renders every page from the loaded PDF at up to 144 dpi, retaining each page's size and orientation; it does not make another export request. Non-PDF documents keep their existing behavior.

PDF.js worker, fonts, character maps, color profiles, and WebAssembly files are served locally from `public/pdfjs/<installed-version>/`. `scripts/prepare-pdf-preview.mjs` generates these ignored assets during install and before development/production builds. If install scripts are disabled, run `npm run prepare:pdf-preview` before starting the app. No API key, environment variable, backend change, or external viewer service is required.

Preview tests: `node --test tests/pdf-preview.test.mjs tests/pdf-download.test.mjs tests/student-storage-download.test.mjs`.
