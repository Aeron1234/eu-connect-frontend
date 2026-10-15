

export function openPdfBlob(blob) {
  const url = URL.createObjectURL(blob);
  const tab = window.open(url, "_blank");
  if (!tab) window.location.href = url;
  window.setTimeout(() => URL.revokeObjectURL(url), 10 * 60_000);
}
