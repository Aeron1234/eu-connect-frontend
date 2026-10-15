"use server";

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
        `${process.env.API_BASE_URL}/api/announcements/history?category=${category}&page=${page}&search=${search}`,
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
        `${process.env.API_BASE_URL}/api/announcements/history?category=${category}&page=${page}&search=${search}`,
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
      `${process.env.API_BASE_URL}/api/announcements/categories`,
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

export async function createAnnouncement(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const announcementData = Object.fromEntries(formData);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/announcement/new`,
      {
        method: "POST",
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
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function togglePinAnnouncement(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const announcementId = formData.get("announcementId");
    const is_pinned = formData.get("is_pinned");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/announcements/pin/${announcementId}`,
      {
        method: "PATCH",
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
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function updateAnnouncement(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const announcementData = Object.fromEntries(formData);
    const announcementId = announcementData.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/announcements/${announcementId}`,
      {
        method: "PATCH",
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
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function deleteAnnouncement(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const announcementId = formData.get("announcementId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/announcement/${announcementId}`,
      {
        method: "DELETE",
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
      error: "Couldn't reach the server. Check your connection and try again.",
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
    `${process.env.API_BASE_URL}/api/announcements/${encodeURIComponent(id)}`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" },
  );
  if (!res.ok) await throwApiError(res);
  return res.json();
}

export async function getAnnouncementByIdResult(id) {
  return toReadActionResult(getAnnouncementById, [id]);
}
