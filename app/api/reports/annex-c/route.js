import { generateAnnexCPdf } from "@/app/_services/pdfReports";
import { getAccessToken } from "@/lib/server-actions/auth";
import { NextResponse } from "next/server";
import { pdfErrorResponse } from "@/app/_services/pdfResponse.mjs";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const reportId = searchParams.get("reportId");

  if (!reportId) {
    return NextResponse.json(
      { error: "reportId is required." },
      { status: 400 },
    );
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const pdfBuffer = await generateAnnexCPdf(reportId, accessToken);
    if (!pdfBuffer) {
      return NextResponse.json({ error: "No records found." }, { status: 404 });
    }

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="annex-c-${reportId}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    return pdfErrorResponse(err, "Could not generate the annual report PDF.");
  }
}
