import { generateStudentEvaluationPdf } from "@/app/_services/pdfReports";
import { getAccessToken } from "@/app/_services/auth";
import { NextResponse } from "next/server";

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
        "Content-Disposition": `inline; filename="student-evaluation-${evaluationId}.pdf"`,
      },
    });
  } catch (err) {
    const status = err.message.includes("authorized") ? 403 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
