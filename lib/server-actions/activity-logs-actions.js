"use server";

import { getApiBaseUrl } from "../api-base-url.mjs";

import { cache } from "react";
import { getAccessToken } from "./auth";
import { revalidatePath } from "next/cache";
import { parseApiResponse, throwApiError, toReadActionResult } from "../api-response";

export const getMyActivityLogs = cache(async ({ page = 1 } = {}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Not signed in.");

    const params = new URLSearchParams({ page: String(page) });

    const res = await fetch(
      `${getApiBaseUrl()}/activity-logs/mine?${params.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
});

export async function getMyActivityLogsResult(options) {
  return toReadActionResult(getMyActivityLogs, [options]);
}

export const getAllActivityLogs = cache(
  async ({
    action = "",
    actorRole = "",
    targetType = "",
    search = "",
    page = 1,
  } = {}) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Not signed in.");

      const params = new URLSearchParams({ page: String(page) });
      if (action) params.set("action", action);
      if (actorRole) params.set("actorRole", actorRole);
      if (targetType) params.set("targetType", targetType);
      if (search) params.set("search", search);

      const res = await fetch(
        `${getApiBaseUrl()}/activity-logs?${params.toString()}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (!res.ok) await throwApiError(res);

      return await res.json();
    } catch (error) {
      throw error;
    }
  },
);

export const deleteActivityLog = async (formData) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "Not signed in." };
    }

    const logId = formData.get("logId");

    const res = await fetch(
      `${getApiBaseUrl()}/activity-logs/${logId}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/admin/activity-logs");
    return result;
  } catch (err) {
    console.error("deleteActivityLog failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
};


// Client interactions receive a serializable error; page reads throw.
export async function getAllActivityLogsResult(...args) {
  return toReadActionResult(getAllActivityLogs, args);
}

export async function previewActivityLogBatchDelete({ fromDate, throughDate }) {
  return toReadActionResult(async () => {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      const error = new Error("Not signed in.");
      error.status = 401;
      throw error;
    }
    const params = new URLSearchParams({ fromDate, throughDate });
    const res = await fetch(
      `${getApiBaseUrl()}/activity-logs/batch-delete-preview?${params}`,
      { cache: "no-store", headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!res.ok) await throwApiError(res);
    return res.json();
  }, []);
}

export async function deleteActivityLogsByDateRange({ fromDate, throughDate }) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { success: false, error: "Not signed in." };
    const res = await fetch(`${getApiBaseUrl()}/activity-logs/batch`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ fromDate, throughDate }),
    });
    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/admin/activity-logs");
    return result;
  } catch (error) {
    console.error("deleteActivityLogsByDateRange failed:", error);
    return { success: false, error: "Couldn't reach the server. Check your connection and try again." };
  }
}
