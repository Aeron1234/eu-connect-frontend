"use server";

import { cache } from "react";
import { getAccessToken } from "./auth";
import { revalidatePath } from "next/cache";
import { parseApiResponse, getErrorMessage } from "../api-response";

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

      if (!res.ok) {
        return { error: await getErrorMessage(res) };
      }

      const data = await res.json().catch(() => null);
      return data || [];
    } catch (err) {
      console.log(err);
      return null;
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

      if (!res.ok) {
        return { error: await getErrorMessage(res) };
      }

      const data = await res.json().catch(() => null);
      return data || [];
    } catch (err) {
      console.log(err);
      return null;
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

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    const data = await res.json().catch(() => null);
    return data || [];
  } catch (err) {
    return null;
  }
});

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
    if (result.success) revalidatePath("/announcements");
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
    if (result.success) revalidatePath("/announcements");
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
