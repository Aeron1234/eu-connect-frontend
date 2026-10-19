import { generateSummaryReportPdf } from "@/app/_services/pdfReports";
import { getAccessToken } from "@/lib/server-actions/auth";
import { NextResponse } from "next/server";
import { pdfErrorResponse } from "@/app/_services/pdfResponse.mjs";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request) {
  const internshipId = new URL(request.url).searchParams.get("internshipId");
  if (!internshipId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(internshipId)) {
    return NextResponse.json({ error: "A valid internship ID is required." }, { status: 400 });
  }
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  try {
    const pdf = await generateSummaryReportPdf(internshipId, token);
    if (!pdf) return NextResponse.json({ error: "Summary report not found." }, { status: 404 });
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="summary-report-${internshipId}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return pdfErrorResponse(error, "Could not generate the summary report PDF.");
  }
}
