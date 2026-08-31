import { generateAnnexCPdf } from "@/app/_services/pdfReports";
import { getUserSession } from "@/app/_services/services";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const reportId = searchParams.get("reportId");

  if (!reportId) {
    return NextResponse.json(
      { error: "reportId is required." },
      { status: 400 },
    );
  }

  const session = await getUserSession();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const pdfBuffer = await generateAnnexCPdf(reportId, userId);
    if (!pdfBuffer) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="annex-c-${reportId}.pdf"`,
      },
    });
  } catch (err) {
    const status = err.message.includes("authorized") ? 403 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
