import { NextResponse } from "next/server";
import { generateAnnexCPdf } from "../../../_services/pdfReports";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const reportId = searchParams.get("id");

  const pdfBuffer = await generateAnnexCPdf(reportId);
  if (!pdfBuffer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="annex-c-${reportId}.pdf"`,
    },
  });
}
