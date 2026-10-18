"use server";

import { getApiBaseUrl } from "../api-base-url.mjs";

import { getAccessToken, getUserSession } from "./auth";
import { getErrorMessage, parseApiResponse } from "../api-response";
import { revalidatePath } from "next/cache";

async function readErrors(path) {
  try {
    const session = await getUserSession();
    if (session?.user?.role !== "admin") return { error: "Only administrators can view error tracking." };
    const token = await getAccessToken();
    if (!token) return { error: "Your session has expired. Please sign in again." };
    const response = await fetch(`${getApiBaseUrl()}/errors${path}`, {
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

export async function deleteErrorGroup(fingerprint) {
  if (typeof fingerprint !== "string" || !/^[a-f0-9]{64}$/.test(fingerprint)) {
    return { success: false, error: "Invalid error group." };
  }
  try {
    const session = await getUserSession();
    if (session?.user?.role !== "admin") {
      return { success: false, error: "Only administrators can delete error groups." };
    }
    const token = await getAccessToken();
    if (!token) return { success: false, error: "Your session has expired. Please sign in again." };
    const response = await fetch(`${getApiBaseUrl()}/errors/${fingerprint}`, {
      method: "DELETE",
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await parseApiResponse(response);
    if (result.success) revalidatePath("/admin/error-tracking");
    return result;
  } catch (error) {
    console.error("Could not delete error group:", error);
    return { success: false, error: "Could not reach error tracking. Please try again." };
  }
}
