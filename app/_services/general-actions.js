"use server";

import { revalidatePath } from "next/cache";
import { getUserSession } from "./services";

export async function markAsRead(notificationId) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/notifications/${notificationId}?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/notifications?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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

export async function saveSearchHistory({
  searchedId = "",
  searchedUUID = "",
  type,
}) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/save-search-history?userId=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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
    const session = await getUserSession();
    if (
      !session?.user ||
      !["student", "employer", "department_head", "admin"].includes(
        session.user.role,
      )
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/clear-search-history?userId=${userId}&type=${type}`,
      {
        method: "DELETE",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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
    const session = await getUserSession();
    if (
      !session?.user ||
      !["student", "employer", "department_head", "admin"].includes(
        session.user.role,
      )
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/delete-search-history/${historyId}?userId=${userId}&type=${type}`,
      {
        method: "DELETE",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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
