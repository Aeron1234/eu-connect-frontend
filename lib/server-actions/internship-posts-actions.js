"use server";

import { getApiBaseUrl } from "../api-base-url.mjs";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "./auth";
import { cache } from "react";
import { parseApiResponse, throwApiError, toReadActionResult } from "../api-response";

// Return the backend's confirmed favorite boolean. The client serializes calls
// because repeating this endpoint reverses state rather than setting it.
export async function toggleInternshipFavorite(postingId) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const res = await fetch(
      `${getApiBaseUrl()}/internship-postings/toggle-favorite/${postingId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/internships");
    return result;
  } catch (err) {
    console.error("toggleInternshipFavorite failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export const getInternshipPosts = cache(
  async ({
    workType = "",
    courseId = "",
    search = "",
    mine = "",
    favorite = "",
    page = 1,
  }) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("You must be logged in.");

      const params = new URLSearchParams({
        workType,
        courseId,
        search,
        mine,
        favorite,
        page,
      });

      const res = await fetch(
        `${getApiBaseUrl()}/internship-postings?${params.toString()}`,
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
  },
);

// Repeated course_ids controls must become an array; Object.fromEntries alone
// would keep only the last checked course.
export async function createInternshipPosting(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const payload = Object.fromEntries(formData.entries());
    payload.course_ids = formData.getAll("course_ids");

    const res = await fetch(
      `${getApiBaseUrl()}/internship-postings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/internships");
    return result;
  } catch (err) {
    console.error("createInternshipPosting failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

// This form submits the complete selected course set for replacement, even though
// the API can preserve links when course_ids is omitted by another caller.
export async function updateInternshipPosting(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const postingId = formData.get("postingId");
    const payload = Object.fromEntries(formData.entries());
    payload.course_ids = formData.getAll("course_ids");

    const res = await fetch(
      `${getApiBaseUrl()}/internship-postings/${postingId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/internships");
    return result;
  } catch (err) {
    console.error("updateInternshipPosting failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function deleteInternshipPosting(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const postingId = formData.get("postingId");

    const res = await fetch(
      `${getApiBaseUrl()}/internship-postings/${postingId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/internships");
    return result;
  } catch (err) {
    console.error("deleteInternshipPosting failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}


// Client interactions receive a serializable error; page reads throw.
export async function getInternshipPostsResult(...args) {
  return toReadActionResult(getInternshipPosts, args);
}
