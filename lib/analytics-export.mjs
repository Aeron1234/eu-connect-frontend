// Guard spreadsheet formulas in free-text company/course labels, then quote CSV.
export function analyticsCsv(headers, rows) {
  const cell=value=>{let text=String(value??'');if(/^[\s]*[=+@-]/.test(text)||/^[\t\r]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';};
  return '\ufeff'+[headers,...rows].map(row=>row.map(cell).join(',')).join('\r\n');
}
