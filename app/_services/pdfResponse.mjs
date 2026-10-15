export function pdfErrorResponse(error, fallback) {
  const status = Number.isInteger(error?.status) && error.status >= 400 && error.status <= 599
    ? error.status : 500;
  const controlled = ["PDF_BUSY", "PDF_TIMEOUT"].includes(error?.code);
  const headers = { "Cache-Control": "private, no-store" };
  if (error?.code === "PDF_BUSY") headers["Retry-After"] = "5";
  return Response.json({
    error: status < 500 || controlled ? error.message : fallback,
    ...(controlled ? { code: error.code } : {}),
  }, { status, headers });
}
