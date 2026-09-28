"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "./auth";

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
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error: error.message || "Failed to load notifications.",
      };
    }

    return await res.json();
  } catch (err) {
    console.log(err);
    return null;
  }
};

export async function markAsRead(notificationId) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

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

    if (res.ok) {
      revalidatePath("/notifications");
    }

    return await res.json();
  } catch (err) {
    console.error("Create Record Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function markAllAsRead(formData = null) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const res = await fetch(`${process.env.API_BASE_URL}/api/notifications`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.ok) {
      revalidatePath("/notifications");
    }

    return await res.json();
  } catch (err) {
    console.error("Create Record Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteNotification(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const notificationId = formData.get("notificationId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/notifications/${notificationId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data = await res.json();
    if (res.ok) revalidatePath("/notifications");

    return data;
  } catch (err) {
    console.error("Delete notification error: ", err.message);
    return { success: false, error: err.message };
  }
}
