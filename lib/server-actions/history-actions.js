"use server";

import { cache } from "react";
import { getAccessToken } from "./auth";
import { parseApiResponse, throwApiError, toReadActionResult } from "../api-response";

export const getSearchHistory = cache(async ({ type }) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/search-history?type=${type}`,
      {
        method: "GET",
        cache: "no-store",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
});

export async function getSearchHistoryResult(...args) {
  return toReadActionResult(getSearchHistory, args);
}

export async function saveSearchHistory({
  searchedId = "",
  searchedUUID = "",
  type,
}) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

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

    const result = await parseApiResponse(res);
    return result;
  } catch (err) {
    console.error("saveSearchHistory failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export const clearSearchHistory = async ({ type }) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/clear-search-history?type=${type}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const result = await parseApiResponse(res);
    return result;
  } catch (err) {
    console.error("clearSearchHistory failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
};

export async function deleteSearchHistoryItem({ historyId, type }) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/delete-search-history/${historyId}?type=${type}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const result = await parseApiResponse(res);
    return result;
  } catch (err) {
    console.error("deleteSearchHistoryItem failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}
