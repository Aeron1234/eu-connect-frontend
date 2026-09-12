import { generateAnnexDPdf } from "@/app/_services/pdfReports";
import { getAccessToken } from "@/app/_services/auth";
import { NextResponse } from "next/server";

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
        "Content-Disposition": `inline; filename="annex-d-${academicYear}-${companyKey}.pdf"`,
      },
    });
  } catch (err) {
    const status = err.message.includes("authorized") ? 403 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
