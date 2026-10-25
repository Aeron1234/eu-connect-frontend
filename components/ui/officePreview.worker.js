import { parseSpreadsheet } from "../../lib/office-preview-data.mjs";
import { validateOfficeArchive } from "../../lib/document-preview.mjs";

self.onmessage = async ({ data }) => {
  try {
    if (data.kind === "docx") {
      validateOfficeArchive(data.buffer, "word/document.xml");
      self.postMessage({ ok: true, result: null });
    } else {
      self.postMessage({ ok: true, result: parseSpreadsheet(data.buffer, data.sheet || 0) });
    }
  } catch { self.postMessage({ ok: false, error: "This file could not be read. It may be damaged, password-protected, or too large. You can download the original file." }); }
};
