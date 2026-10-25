import * as XLSX from "xlsx";
import { validateOfficeArchive } from "./document-preview.mjs";

export const SHEET_ROW_LIMIT = 1000, SHEET_COLUMN_LIMIT = 100;
export function parseSpreadsheet(buffer, selectedIndex = 0) {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) validateOfficeArchive(buffer, "xl/workbook.xml");
  const metadata = XLSX.read(buffer, { type: "array", bookSheets: true, bookProps: true, bookVBA: false });
  const names = metadata.SheetNames || [];
  if (!names.length) throw new Error("No worksheets were found in this file.");
  if (names.length > 100) throw new Error("This workbook has too many sheets for browser preview.");
  const index = Math.min(Math.max(0, selectedIndex), names.length - 1);
  const workbook = XLSX.read(buffer, { type: "array", sheets: index, sheetRows: SHEET_ROW_LIMIT, cellHTML: false, cellFormula: false, bookVBA: false, cellText: true });
  const sheet = workbook.Sheets[names[index]];
  if (!sheet?.["!ref"]) return { names, index, rows: [], columns: [], truncated: Boolean(sheet?.["!fullref"]) };
  const range = XLSX.utils.decode_range(sheet["!ref"]);
  const full = XLSX.utils.decode_range(sheet["!fullref"] || sheet["!ref"]);
  const endColumn = Math.min(range.e.c, range.s.c + SHEET_COLUMN_LIMIT - 1);
  const endRow = Math.min(range.e.r, range.s.r + SHEET_ROW_LIMIT - 1);
  const columns = [];
  for (let col = range.s.c; col <= endColumn; col++) columns.push(XLSX.utils.encode_col(col));
  const rows = []; let totalCharacters = 0;
  for (let row = range.s.r; row <= endRow; row++) {
    const cells = [];
    for (let col = range.s.c; col <= endColumn; col++) {
      const cell = sheet[XLSX.utils.encode_cell({ r: row, c: col })];
      // Display only saved text/values. Never render cell HTML, links, or run formulas.
      const value = cell?.w ?? (cell?.v == null ? "" : String(cell.v));
      totalCharacters += String(value).length;
      if (String(value).length > 32000 || totalCharacters > 2_000_000) throw new Error("A spreadsheet cell is too large for preview.");
      cells.push(String(value));
    }
    rows.push({ number: row + 1, cells });
  }
  return { names, index, columns, rows, truncated: full.e.r > endRow || full.e.c > endColumn };
}
