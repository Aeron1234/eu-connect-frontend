"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "./auth";
import { parseApiResponse, throwApiError, toReadActionResult } from "../api-response";

export const getUnreadNotificationCount = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/notifications/unread-count`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      },
    );

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const getInbox = async ({
  scope = "all",
  page = 1,
  limit = 10,
} = {}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const params = new URLSearchParams({
      scope,
      page: String(page),
      limit: String(limit),
    });

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/notifications?${params.toString()}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      },
    );

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
};

export async function markAsRead(notificationId) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/notifications/${notificationId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/notifications");
    return result;
  } catch (err) {
    console.error("markAsRead failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function openAnnouncementNotification(notificationId) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { success: false, status: 401, error: "You must be logged in." };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/notifications/${encodeURIComponent(notificationId)}/open-announcement`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      },
    );
    return { ...(await parseApiResponse(res)), status: res.status };
  } catch (error) {
    console.error("openAnnouncementNotification failed:", error);
    return {
      success: false,
      status: 0,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function markAllAsRead() {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const res = await fetch(`${process.env.API_BASE_URL}/api/notifications`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/notifications");
    return result;
  } catch (err) {
    console.error("markAllAsRead failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function deleteNotification(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const notificationId = formData.get("notificationId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/notifications/${notificationId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/notifications");
    return result;
  } catch (err) {
    console.error("deleteNotification failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}


// Client interactions receive a serializable error; page reads throw.
export async function getInboxResult(...args) {
  return toReadActionResult(getInbox, args);
}

export async function getUnreadNotificationCountResult(...args) {
  return toReadActionResult(getUnreadNotificationCount, args);
}
