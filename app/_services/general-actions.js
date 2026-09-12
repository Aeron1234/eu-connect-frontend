"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken, getUserSession } from "./auth";
import { cache } from "react";
// import { getUserSession } from "./services";

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

export async function saveSearchHistory({
  searchedId = "",
  searchedUUID = "",
  type,
}) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/save-search-history`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          searched_uuid: searchedUUID,
          searched_id: searchedId,
          type,
        }),
      },
    );

    if (res.ok) {
      revalidatePath("/users");
    }

    return await res.json();
  } catch (err) {
    console.error("Save history error: ", err.message);
    return { success: false, error: err.message };
  }
}

export const clearSearchHistory = async ({ type }) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/clear-search-history?type=${type}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (res.ok) {
      revalidatePath("/users");
    }

    return await res.json();
  } catch (err) {
    console.error("Clear history error:", err.message);
    return { success: false, error: err.message };
  }
};

export async function deleteSearchHistoryItem({ historyId, type }) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/delete-search-history/${historyId}?type=${type}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (res.ok) {
      revalidatePath("/users");
    }

    return await res.json();
  } catch (err) {
    console.error("Delete history item error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function updateUserInfo(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    const session = await getUserSession();
    if (!accessToken || !session?.user) {
      throw new Error("You must be logged in.");
    }

    const userRole = session.user.role;
    const userInfo = Object.fromEntries(formData);

    const res = await fetch(`${process.env.API_BASE_URL}/api/account/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(userInfo),
    });

    const data = await res.json();
    if (res.ok) revalidatePath(`/${userRole}/account`);

    return data;
  } catch (err) {
    console.log(err);
    return { success: false, error: err.message };
  }
}

export async function updatePassword(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    const session = await getUserSession();
    if (!accessToken || !session?.user) {
      throw new Error("You must be logged in.");
    }

    const userRole = session.user.role;
    const newPassword = Object.fromEntries(formData);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/account/update-password`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newPassword),
      },
    );

    const data = await res.json();
    if (res.ok) revalidatePath(`/${userRole}/account`);

    return data;
  } catch (err) {
    console.log(err);
    return { success: false, error: err.message };
  }
}

export const getMyActivityLogs = cache(async ({ page = 1 } = {}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "Not signed in." };

    const params = new URLSearchParams({ page: String(page) });

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/activity-logs/mine?${params.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return { error: error.error || "Failed to load activity logs." };
    }

    return await res.json();
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while loading activity logs." };
  }
});
