// app/api/users/route.js
import { getUserSession } from "@/app/_services/services";
import { NextResponse } from "next/server";

export async function GET(request) {
  // 1. Authenticate and authorize the user session
  const session = await getUserSession();
  if (
    !session?.user ||
    !["student", "admin", "employer", "department_head"].includes(
      session.user.role,
    )
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // 2. Extract the search query string
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  // 🛡️ Guard Clause: If empty OR 3 characters or less, return empty results immediately
  if (!q || q.length <= 2) {
    return NextResponse.json({ success: true, users: [] });
  }

  // 3. Server-secret environment variables
  const backendUrl = process.env.API_BASE_URL;
  const secretKey = process.env.BACKEND_SECRET_KEY;

  const queryPath = `/api/search-users?userId=${userId}&q=${encodeURIComponent(q)}`;

  try {
    // 4. Secure server-to-server fetch
    const res = await fetch(`${backendUrl}${queryPath}`, {
      method: "GET",
      headers: {
        "x-api-key": secretKey,
        "Content-Type": "application/json",
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
