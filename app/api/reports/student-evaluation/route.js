import { generateStudentEvaluationPdf } from "@/app/_services/pdfReports";
import { getAccessToken } from "@/lib/server-actions/auth";
import { NextResponse } from "next/server";
import { pdfErrorResponse } from "@/app/_services/pdfResponse.mjs";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const evaluationId = searchParams.get("evaluationId");

  if (!evaluationId) {
    return NextResponse.json(
      { error: "evaluationId is required." },
      { status: 400 },
    );
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const pdfBuffer = await generateStudentEvaluationPdf(
      evaluationId,
      accessToken,
    );
    if (!pdfBuffer) {
      return NextResponse.json({ error: "No records found." }, { status: 404 });
    }

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="student-evaluation-${evaluationId}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    return pdfErrorResponse(err, "Could not generate the evaluation PDF.");
  }
}
