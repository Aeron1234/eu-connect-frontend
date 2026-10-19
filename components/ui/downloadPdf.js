export async function downloadPdf(response, fallbackFilename = "report.pdf") {
  const disposition = response.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="([^"]+)"/i) || disposition.match(/filename=([^;]+)/i);
  const filename = (match?.[1] || fallbackFilename).replace(/[\\/:*?"<>|]/g, "_").trim() || "report.pdf";
  const blob = await response.blob();
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
