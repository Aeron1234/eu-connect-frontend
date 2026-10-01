"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "./auth";
import { parseApiResponse, getErrorMessage } from "../api-response";

export const getAlumniInternships = async ({
  academicYear,
  search = "",
  page = 1,
}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const params = new URLSearchParams({ page: String(page) });
    if (academicYear) params.set("academicYear", academicYear);
    if (search) params.set("search", search);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/alumni-internships?${params.toString()}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    return await res.json().catch(() => null);
  } catch (err) {
    console.log(err);
    return null;
  }
};

export async function postAlumniRecord(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const pastRecord = Object.fromEntries(formData);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/alumni-internships`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(pastRecord),
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/past-internships");
    return result;
  } catch (err) {
    console.error("postAlumniRecord failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function deleteAlumniRecord(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const recordId = formData.get("recordId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/alumni-internships/${recordId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/past-internships");
    return result;
  } catch (err) {
    console.error("deleteAlumniRecord failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function updateAlumniRecord(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const recordData = Object.fromEntries(formData);
    const recordId = recordData.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/alumni-internships/${recordId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(recordData),
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/past-internships");
    return result;
  } catch (err) {
    console.error("updateAlumniRecord failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}
