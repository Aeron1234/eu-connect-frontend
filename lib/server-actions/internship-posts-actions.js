"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "./auth";
import { cache } from "react";

export async function toggleInternshipFavorite(postingId) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-postings/toggle-favorite/${postingId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (res.ok) {
      revalidatePath("/internships");
    }

    return await res.json();
  } catch (err) {
    console.error("Post internship error: ", err.message);
    return { success: false, error: err.message };
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
        `${process.env.API_BASE_URL}/api/internship-postings?${params.toString()}`,
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
          error:
            error.message ||
            "Failed to get internship posts. Please try again.",
        };
      }

      const data = await res.json();

      return data;
    } catch (err) {
      console.log(err);
      return null;
    }
  },
);

export async function createInternshipPosting(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const payload = Object.fromEntries(formData.entries());
    payload.course_ids = formData.getAll("course_ids");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-postings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (res.ok) {
      revalidatePath("/internships");
    }

    return await res.json();
  } catch (err) {
    console.error("Post internship error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function updateInternshipPosting(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const postingId = formData.get("postingId");
    const payload = Object.fromEntries(formData.entries());
    payload.course_ids = formData.getAll("course_ids");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-postings/${postingId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (res.ok) revalidatePath("/internships");

    return await res.json();
  } catch (err) {
    console.log(err);
    return { success: false, error: err.message };
  }
}

export async function deleteInternshipPosting(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const postingId = formData.get("postingId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-postings/${postingId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (res.ok) {
      revalidatePath("/internships");
    }

    return await res.json();
  } catch (err) {
    console.error("Delete pending student evaluation error: ", err.message);
    return { success: false, error: err.message };
  }
}
