"use server";

import { getApiBaseUrl } from "../api-base-url.mjs";
import { getAccessToken } from "./auth";
import { parseApiResponse } from "../api-response";
import { revalidatePath } from "next/cache";

// Authenticated API calls; access/ownership and overlap checks live in the backend.
async function request(internshipId, suffix = "", method = "GET", body) {
  const token = await getAccessToken();
  if (!token) return { success: false, error: "You must be logged in." };
  if (!internshipId) return { success: false, error: "Choose an internship record." };
  try {
    const response = await fetch(`${getApiBaseUrl()}/internship-records/${encodeURIComponent(internshipId)}/rotations${suffix}`, {
      method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store", signal: AbortSignal.timeout(20000),
    });
    const result = await parseApiResponse(response);
    if (method !== "GET" && result.success) {
      revalidatePath("/student/internship-record");
      revalidatePath("/student/narratives");
      revalidatePath(`/internship-records/${internshipId}`);
    }
    return result;
  } catch {
    return { success: false, error: method === "GET" ? "Could not load company rotations. Please try again." : "Could not confirm the change. Refresh the timeline before trying again." };
  }
}

export async function getInternshipRotations(internshipId) { return request(internshipId); }
export async function setInternshipRotationsEnabled(internshipId, enabled) { return request(internshipId, "/settings", "PATCH", { enabled }); }
export async function saveInternshipRotation(internshipId, fields, rotationId) {
  return request(internshipId, rotationId ? "/" + encodeURIComponent(rotationId) : "", rotationId ? "PATCH" : "POST", fields);
}
export async function deleteInternshipRotation(internshipId, rotationId) {
  return request(internshipId, "/" + encodeURIComponent(rotationId), "DELETE");
}
