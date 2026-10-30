"use server";

import { getApiBaseUrl } from "../api-base-url.mjs";

import { cache } from "react";
import { getAccessToken } from "./auth";
import { revalidatePath } from "next/cache";
import { parseApiResponse, throwApiError, toReadActionResult } from "../api-response";

export const getAllAnnouncements = cache(
  async ({ category = "all", page = 1, search = "" }) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("You must be logged in.");

      const res = await fetch(
        `${getApiBaseUrl()}/announcements/history?category=${category}&page=${page}&search=${search}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!res.ok) await throwApiError(res);

      const data = await res.json();
      return data || [];
    } catch (error) {
      throw error;
    }
  },
);

export const fetchMoreAnnouncements = cache(
  async ({ category = "all", page = 1, search = "" }) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("You must be logged in.");

      const res = await fetch(
        `${getApiBaseUrl()}/announcements/history?category=${category}&page=${page}&search=${search}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!res.ok) await throwApiError(res);

      const data = await res.json();
      return data || [];
    } catch (error) {
      throw error;
    }
  },
);

export const getAnnouncementCategories = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${getApiBaseUrl()}/announcements/categories`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) await throwApiError(res);

    const data = await res.json();
    return data || [];
  } catch (error) {
    throw error;
  }
});

export async function getAnnouncementCategoriesResult() {
  return toReadActionResult(getAnnouncementCategories, []);
}

export async function getAnnouncementTagStudents(search = '') {
  try {
    const token = await getAccessToken();
    if (!token) return { success: false, error: 'Your session has expired.' };
    const response = await fetch(`${getApiBaseUrl()}/announcements/tag-students?search=${encodeURIComponent(search)}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    return parseApiResponse(response);
  } catch { return { success: false, error: 'Could not load students. Please retry.' }; }
}

export async function createAnnouncement(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const announcementData = Object.fromEntries(formData);

    const res = await fetch(
      `${getApiBaseUrl()}/announcement/new`,
      {
        method: "POST",
          signal: AbortSignal.timeout(20000),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(announcementData),
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) {
      revalidatePath("/announcements");
      revalidatePath("/calendar");
    }
    return result;
  } catch (err) {
    console.error("createAnnouncement failed:", err);
    return {
      success: false,
      error: err?.name === "TimeoutError" || err?.name === "AbortError" ? "The request timed out. Refresh announcements to check whether the change was saved before trying again." : "Couldn't reach the server. Refresh announcements before trying again.",
    };
  }
}

export async function togglePinAnnouncement(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const announcementId = formData.get("announcementId");
    const is_pinned = formData.get("is_pinned");

    const res = await fetch(
      `${getApiBaseUrl()}/announcements/pin/${announcementId}`,
      {
        method: "PATCH",
          signal: AbortSignal.timeout(20000),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ is_pinned }),
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/announcements");
    return result;
  } catch (err) {
    console.error("togglePinAnnouncement failed:", err);
    return {
      success: false,
      error: err?.name === "TimeoutError" || err?.name === "AbortError" ? "The request timed out. Refresh announcements to check whether the change was saved before trying again." : "Couldn't reach the server. Refresh announcements before trying again.",
    };
  }
}

export async function updateAnnouncement(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const announcementData = Object.fromEntries(formData);
    const announcementId = announcementData.id;

    const res = await fetch(
      `${getApiBaseUrl()}/announcements/${announcementId}`,
      {
        method: "PATCH",
          signal: AbortSignal.timeout(20000),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(announcementData),
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) {
      revalidatePath("/announcements");
      revalidatePath("/calendar");
    }
    return result;
  } catch (err) {
    console.error("updateAnnouncement failed:", err);
    return {
      success: false,
      error: err?.name === "TimeoutError" || err?.name === "AbortError" ? "The request timed out. Refresh announcements to check whether the change was saved before trying again." : "Couldn't reach the server. Refresh announcements before trying again.",
    };
  }
}

export async function deleteAnnouncement(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const announcementId = formData.get("announcementId");

    const res = await fetch(
      `${getApiBaseUrl()}/announcement/${announcementId}`,
      {
        method: "DELETE",
          signal: AbortSignal.timeout(20000),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) {
      revalidatePath("/announcements");
      revalidatePath("/notifications");
      revalidatePath("/calendar");
    }
    return result;
  } catch (err) {
    console.error("deleteAnnouncement failed:", err);
    return {
      success: false,
      error: err?.name === "TimeoutError" || err?.name === "AbortError" ? "The request timed out. Refresh announcements to check whether the change was saved before trying again." : "Couldn't reach the server. Refresh announcements before trying again.",
    };
  }
}


// Client interactions receive a serializable error; page reads throw.
export async function getAllAnnouncementsResult(...args) {
  return toReadActionResult(getAllAnnouncements, args);
}

export async function getAnnouncementById(id) {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error("You must be logged in.");
  const res = await fetch(
    `${getApiBaseUrl()}/announcements/${encodeURIComponent(id)}`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" },
  );
  if (!res.ok) await throwApiError(res);
  return res.json();
}

export async function getAnnouncementByIdResult(id) {
  return toReadActionResult(getAnnouncementById, [id]);
}
