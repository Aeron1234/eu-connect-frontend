"use server";

import { getAccessToken, getUserSession } from "./auth";
import { getErrorMessage } from "../api-response";

async function readErrors(path) {
  try {
    const session = await getUserSession();
    if (session?.user?.role !== "admin") return { error: "Only administrators can view error tracking." };
    const token = await getAccessToken();
    if (!token) return { error: "Your session has expired. Please sign in again." };
    const response = await fetch(`${process.env.API_BASE_URL}/api/errors${path}`, {
      method: "GET",
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return { error: await getErrorMessage(response) };
    return await response.json();
  } catch (error) {
    console.error("Could not load error tracking:", error);
    return { error: "Could not reach error tracking. Please try again." };
  }
}

export async function getErrorGroupsResult(filters = {}) {
  const params = new URLSearchParams();
  for (const key of ["days", "method", "source", "status", "search", "page"]) {
    if (filters[key] !== undefined && filters[key] !== "") params.set(key, String(filters[key]));
  }
  const query = params.toString();
  return readErrors(query ? `?${query}` : "");
}

export async function getErrorGroupResult(fingerprint) {
  if (!/^[a-f0-9]{64}$/.test(String(fingerprint))) return { error: "Invalid error group." };
  return readErrors(`/${fingerprint}`);
}
