import { getApiBaseUrl } from "@/lib/api-base-url.mjs";
import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/server-actions/auth";

export async function POST() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const res = await fetch(`${getApiBaseUrl()}/auth/socket-ticket`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not authorize notifications" },
        { status: res.status, headers: { "Cache-Control": "no-store" } },
      );
    }

    const data = await res.json();
    if (typeof data.ticket !== "string" || !data.ticket) {
      throw new Error("Missing socket ticket");
    }
    return NextResponse.json(
      { ticket: data.ticket },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Socket ticket request failed:", error);
    return NextResponse.json(
      { error: "Notification service unavailable" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
