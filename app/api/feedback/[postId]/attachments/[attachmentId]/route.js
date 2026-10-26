import { getAccessToken } from "@/lib/server-actions/auth";
import { getApiBaseUrl } from "@/lib/api-base-url.mjs";
export const dynamic = "force-dynamic";
// Reauthorize every image/preview/download read through the backend before
// fetching its short-lived storage URL. Private responses must not be cached.
export async function GET(request, { params }) {
  const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
  try {
    const token = await getAccessToken();
    if (!token) return Response.json({ error: "Please log in again." }, { status: 401, headers });
    const { postId, attachmentId } = await params;
    const result = await fetch(getApiBaseUrl() + "/feedback/" + encodeURIComponent(postId) + "/attachments/" + encodeURIComponent(attachmentId), {
      headers: { Authorization: "Bearer " + token }, cache: "no-store", signal: AbortSignal.timeout(25000),
    });
    if (!result.ok) return Response.json({ error: result.status === 404 || result.status === 403 ? "Attachment unavailable or access denied." : "Could not open attachment." }, { status: result.status, headers });
    const data = await result.json();
    if (!data.url || !["application/pdf", "image/png", "image/jpeg", "image/webp"].includes(data.mime)) throw new Error("Invalid attachment");
    const url = new URL(data.url);
    if (url.protocol !== "https:") throw new Error("Invalid attachment URL");
    // Do not forward application credentials to storage. Bound this fetch separately
    // from the authorization lookup, then enforce the attachment byte limit.
    const file = await fetch(url, { credentials: "omit", cache: "no-store", signal: AbortSignal.timeout(25000) });
    if (!file.ok) throw new Error("Storage unavailable");
    const blob = await file.arrayBuffer();
    if (blob.byteLength > 5 * 1024 * 1024) throw new Error("Invalid attachment size");
    const filename = String(data.filename || "attachment").replace(/[\r\n]/g, "");
    // Inline preview is the default; download=1 explicitly changes disposition.
    // Keep the filename encoded and the server-approved MIME type with nosniff.
    return new Response(blob, { headers: { ...headers, "Content-Type": data.mime, "Content-Disposition": (new URL(request.url).searchParams.get("download") === "1" ? "attachment" : "inline") + "; filename*=UTF-8''" + encodeURIComponent(filename) } });
  } catch { return Response.json({ error: "Could not open attachment. Please try again." }, { status: 503, headers }); }
}
