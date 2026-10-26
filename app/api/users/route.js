import { getApiBaseUrl } from "@/lib/api-base-url.mjs";
// Same-origin proxy keeps the backend bearer token out of the browser request.
import { getAccessToken } from "@/lib/server-actions/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  // 1. Authenticate — getAccessToken() self-refreshes if the access token
  // is expired but the refresh token is still valid, so this only returns
  // null when the whole session is actually gone.
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2. Extract the search query string
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  // Queries shorter than three trimmed characters return an empty successful list
  // without contacting the backend.
  if (!q || q.length <= 2) {
    return NextResponse.json({ success: true, users: [] });
  }

  // Resolve the server-only backend base and encode the user's query value.
  const backendUrl = getApiBaseUrl();
  const queryPath = `/search-users?q=${encodeURIComponent(q)}`;

  try {
    // 4. Secure server-to-server fetch
    const res = await fetch(`${backendUrl}${queryPath}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "Backend search failed" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy failure error logging:", error);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
