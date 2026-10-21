"use server";

import { fetchUpload, uploadRequestFailure } from "../upload-request.mjs";

import { getApiBaseUrl } from "../api-base-url.mjs";

import { getAccessToken } from "./auth";
import { parseApiResponse, throwApiError, toReadActionResult } from "../api-response";

export async function getSummaryReports() {
  const token = await getAccessToken();
  if (!token) throw new Error("You must be logged in.");
  const response = await fetch(`${getApiBaseUrl()}/summary-reports`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) await throwApiError(response);
  return response.json();
}

export async function getSummaryReportsResult() {
  return toReadActionResult(getSummaryReports, []);
}

export async function getInternshipRecordSummaryReport(internshipId) {
  const token = await getAccessToken();
  if (!token) throw new Error("You must be logged in.");
  const response = await fetch(`${getApiBaseUrl()}/internship-records/${encodeURIComponent(internshipId)}/summary-report`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) await throwApiError(response);
  return response.json();
}

export async function getInternshipRecordSummaryReportResult(internshipId) {
  return toReadActionResult(getInternshipRecordSummaryReport, [internshipId]);
}

export async function getInternshipRecordSummaryAttachmentUrl(internshipId) {
  try {
    const token = await getAccessToken();
    if (!token) return { success: false, error: "You must be logged in." };
    const response = await fetch(`${getApiBaseUrl()}/internship-records/${encodeURIComponent(internshipId)}/summary-report/attachment`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return parseApiResponse(response);
  } catch {
    return { success: false, error: "Could not open the attachment." };
  }
}

export async function saveSummaryReport(internshipId, formData, isEditing) {
  try {
    const token = await getAccessToken();
    if (!token) return { success: false, error: "You must be logged in." };
    if (!internshipId || typeof internshipId !== "string") {
      return { success: false, error: "Choose an internship record." };
    }
    const response = await fetchUpload(`${getApiBaseUrl()}/summary-reports/${encodeURIComponent(internshipId)}`, {
      method: isEditing ? "PATCH" : "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      cache: "no-store",
    });
    return await parseApiResponse(response);
  } catch (err) {
    return uploadRequestFailure(err);
  }
}

export async function getSummaryAttachmentUrl(internshipId) {
  try {
    const token = await getAccessToken();
    if (!token) return { success: false, error: "You must be logged in." };
    const response = await fetch(`${getApiBaseUrl()}/summary-reports/${encodeURIComponent(internshipId)}/attachment`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return parseApiResponse(response);
  } catch {
    return { success: false, error: "Could not open the attachment." };
  }
}

export async function deleteSummaryReport(internshipId) {
  try {
    const token = await getAccessToken();
    if (!token) return { success: false, error: "You must be logged in." };
    const response = await fetch(`${getApiBaseUrl()}/summary-reports/${encodeURIComponent(internshipId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return parseApiResponse(response);
  } catch {
    return { success: false, error: "Couldn't reach the server. Check your connection and try again." };
  }
}
