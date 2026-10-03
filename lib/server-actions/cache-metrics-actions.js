"use server";

import { getAccessToken, getUserSession } from "./auth";
import { getErrorMessage } from "../api-response";

export async function getCacheMetrics() {
  try {
    const session = await getUserSession();
    if (session?.user?.role !== "admin") {
      return { error: "Only administrators can view cache monitoring." };
    }

    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "Your session has expired. Please sign in again." };

    const res = await fetch(`${process.env.API_BASE_URL}/api/cache/metrics`, {
      method: "GET",
      cache: "no-store",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return { error: await getErrorMessage(res) };

    const data = await res.json().catch(() => null);
    if (!data?.startedAt || !data?.totals || !Array.isArray(data?.routes)) {
      return { error: "The server returned incomplete cache metrics." };
    }
    return data;
  } catch (error) {
    console.error("Failed to load cache metrics:", error);
    return { error: "Could not reach cache monitoring. Please try again." };
  }
}
