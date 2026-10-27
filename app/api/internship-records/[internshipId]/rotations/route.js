import { getInternshipRotations } from "@/lib/server-actions/rotations-actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

// The API route is outside proxy.js: the helper authenticates from server cookies
// and the backend rechecks current ownership/department access on every read.
export async function GET(request, context) {
  const { internshipId } = await context.params;
  const headers = { "Cache-Control": "private, no-store" };
  if (!/^[a-zA-Z0-9-]{1,36}$/.test(internshipId || "")) {
    return Response.json({ success: false, error: "Choose a valid internship record." }, { status: 400, headers });
  }
  const result = await getInternshipRotations(internshipId);
  const status = result?.success ? 200 : (result?.status >= 400 && result.status <= 599 ? result.status : 502);
  return Response.json(result, { status, headers });
}
