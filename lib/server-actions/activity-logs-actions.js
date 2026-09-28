"use server";

import { cache } from "react";
import { getAccessToken } from "./auth";
import { revalidatePath } from "next/cache";

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
      if (!accessToken) return { error: "Not signed in." };

      const params = new URLSearchParams({ page: String(page) });
      if (action) params.set("action", action);
      if (actorRole) params.set("actorRole", actorRole);
      if (targetType) params.set("targetType", targetType);
      if (search) params.set("search", search);

      const res = await fetch(
        `${process.env.API_BASE_URL}/api/activity-logs?${params.toString()}`,
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
  },
);

export const deleteActivityLog = async (prevState, formData) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "Not signed in." };

    const logId = formData.get("logId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/activity-logs/${logId}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return { error: error.error || "Failed to delete activity log." };
    }

    revalidatePath("/admin/activity-logs");
    return await res.json();
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while deleting activity log." };
  }
};
