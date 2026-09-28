"use server";

import { cache } from "react";
import { getAccessToken } from "./auth";

export const getSearchHistory = cache(async ({ type }) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/search-history?type=${type}`,
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
          error.message || "Failed to get search history. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
});

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
