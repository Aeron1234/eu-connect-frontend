"use server";

import { cache } from "react";
import { getAccessToken } from "./auth";
import { revalidatePath } from "next/cache";

export const getAllAnnouncements = cache(
  async ({ category = "all", page = 1, search = "" }) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("You must be logged in.");

      const res = await fetch(
        `${process.env.API_BASE_URL}/api/announcements/history?category=${category}&page=${page}&search=${search}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!res.ok) {
        const error = await res.json();
        return {
          error:
            error.message || "Failed to get announcements. Please try again.",
        };
      }

      const data = await res.json();

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
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!res.ok) {
        const error = await res.json();
        return {
          error:
            error.message ||
            "Failed to load more announcements. Please try again.",
        };
      }

      const data = await res.json();

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
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.message ||
          "Failed to get announcement categories. Please try again.",
      };
    }

    const data = await res.json();

    return data || [];
  } catch (err) {
    return null;
  }
});

export async function createAnnouncement(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

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

    if (res.ok) {
      revalidatePath("/announcements");
    }

    return await res.json();
  } catch (err) {
    console.error("Create Announcement Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function togglePinAnnouncement(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

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

    if (res.ok) {
      revalidatePath("/announcements");
    }

    return await res.json();
  } catch (err) {
    console.error("Pin Announcement Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function updateAnnouncement(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

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

    if (res.ok) {
      revalidatePath("/announcements");
    }

    return await res.json();
  } catch (err) {
    console.error("Pin Announcement Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteAnnouncement(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

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

    if (res.ok) {
      revalidatePath("/announcements");

      revalidatePath("/notifications");
    }

    return await res.json();
  } catch (err) {
    console.error("Delete Announcement Error: ", err.message);
    return { success: false, error: err.message };
  }
}
