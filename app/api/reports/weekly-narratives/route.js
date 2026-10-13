import { generateWeeklyNarrativesPdf } from "@/app/_services/pdfReports";
import { getAccessToken } from "@/lib/server-actions/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  const internshipId = new URL(request.url).searchParams.get("internshipId");
  if (!internshipId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(internshipId)) {
    return NextResponse.json({ error: "A valid internship ID is required." }, { status: 400 });
  }
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  try {
    const pdf = await generateWeeklyNarrativesPdf(internshipId, token);
    if (!pdf) return NextResponse.json({ error: "No narratives found for this internship." }, { status: 404 });
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="weekly-narratives-${internshipId}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const status = error?.status || 500;
    return NextResponse.json({ error: status < 500 ? error.message : "Could not generate the weekly narratives PDF." }, { status });
  }
}
