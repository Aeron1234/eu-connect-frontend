export function pdfFilename(response, fallbackFilename = "report.pdf") {
  const disposition = response.headers.get("Content-Disposition") || "";
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  const match = disposition.match(/filename="([^"]+)"/i) || disposition.match(/filename=([^;]+)/i);
  let name = match?.[1] || fallbackFilename;
  if (encoded) { try { name = decodeURIComponent(encoded[1]); } catch { /* use ordinary filename */ } }
  return name.replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g, "_").trim() || "report.pdf";
}

export async function downloadPdf(response, fallbackFilename = "report.pdf") {
  const filename = pdfFilename(response, fallbackFilename);
  return downloadPdfBlob(await response.blob(), filename);
}

export function downloadPdfBlob(blob, filename = "report.pdf") {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  let started = false;

  try {
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    started = true;
  } finally {
    link.remove();
    // Give the browser time to start reading the blob before releasing it.
    if (started) window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    else URL.revokeObjectURL(url);
  }
}
