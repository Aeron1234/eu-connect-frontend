"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "./auth";

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
          "Failed to get past internship records of alumni. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export async function postAlumniRecord(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

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

    if (res.ok) {
      revalidatePath("/past-internships");
    }

    return await res.json();
  } catch (err) {
    console.error("Create alumni record error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteAlumniRecord(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

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

    if (res.ok) {
      revalidatePath("/past-internships");
    }

    return await res.json();
  } catch (err) {
    console.error("Delete record error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function updateAlumniRecord(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

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

    if (res.ok) {
      revalidatePath("/past-internships");
    }

    return await res.json();
  } catch (err) {
    console.error("Pin Announcement Error: ", err.message);
    return { success: false, error: err.message };
  }
}
