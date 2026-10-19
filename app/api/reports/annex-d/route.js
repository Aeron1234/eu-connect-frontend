import { generateAnnexDPdf } from "@/app/_services/pdfReports";
import { getAccessToken } from "@/lib/server-actions/auth";
import { NextResponse } from "next/server";
import { pdfErrorResponse } from "@/app/_services/pdfResponse.mjs";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const companyKey = searchParams.get("companyKey");
  const academicYear = searchParams.get("academicYear");

  if (!companyKey || !academicYear) {
    return NextResponse.json(
      { error: "companyKey and academicYear are required." },
      { status: 400 },
    );
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const pdfBuffer = await generateAnnexDPdf(
      companyKey,
      academicYear,
      accessToken,
    );
    if (!pdfBuffer) {
      return NextResponse.json({ error: "No records found." }, { status: 404 });
    }

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="annex-d-${academicYear}-${companyKey}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    return pdfErrorResponse(err, "Could not generate the HTE report PDF.");
  }
}
