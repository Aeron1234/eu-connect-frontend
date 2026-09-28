"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "./auth";
import { getOngoingInternshipRecord } from "./internship-records-actions";
import { cache } from "react";

export const getDtrToday = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData) throw new Error("No ongoing internship found.");

    const internshipId = internshipData.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/dtr/today?internshipId=${internshipId}`,
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
        error: error.message || "Record not found or you haven't clock-in yet.",
      };
    }

    const data = await res.json();

    return data || null;
  } catch (err) {
    return null;
  }
};

// NEW: Optimized for checking status without downloading the whole history
export const getLatestDtrStatus = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData) throw new Error("No ongoing internship found.");

    const internshipId = internshipData.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/dtr/status?internshipId=${internshipId}`,
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
        error: error.message || "Record not found or you haven't clock-in yet.",
      };
    }

    const data = await res.json();

    return data || null;
  } catch (err) {
    return null;
  }
};

export const getDtrs = cache(async (page = 1) => {
  const limit = 5;

  const validatedPage = Math.max(1, parseInt(page));
  const offset = (validatedPage - 1) * limit;

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const internship = await getOngoingInternshipRecord();
    if (!internship) return null;

    const internshipId = internship.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/dtr/history?internshipId=${internshipId}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return { error: error.message || "No ongoing internship found" };
    }

    const data = await res.json();

    return data || [];
  } catch (err) {
    return null;
  }
});

export async function clockIn(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    // 1. Check if they have an internship
    const internship = await getOngoingInternshipRecord();
    if (!internship) throw new Error("No ongoing internship found.");

    const internshipId = internship.id;

    const lat_in = formData.get("lat_in");
    const lon_in = formData.get("lon_in");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/dtr/clock-in?internshipId=${internshipId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ lat_in, lon_in }),
      },
    );

    if (res.ok) {
      revalidatePath("/student");
    }
    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return { success: false, error: err.message };
  }
}

export async function clockOut(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData) throw new Error("No ongoing internship found.");

    const internshipId = internshipData.id;

    const lat_out = formData.get("lat_out");
    const lon_out = formData.get("lon_out");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/dtr/clock-out?internshipId=${internshipId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ lat_out, lon_out }),
      },
    );

    if (res.ok) {
      revalidatePath("/student");
    }

    const data = await res.json();

    return data;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteDtr(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    if (!formData || typeof formData.get !== "function") {
      throw new Error("Invalid form submission.");
    }

    const dtrId = Number(formData.get("dtrId"));

    const res = await fetch(`${process.env.API_BASE_URL}/api/dtr/${dtrId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    if (res.ok) revalidatePath("/student");

    return data;
  } catch (err) {
    console.error("Delete Error:", err.message);
    return { success: false, error: err.message };
  }
}

export const getSearchedStudentDTRs = cache(
  async (searchedUserId, page = 1) => {
    const limit = 5;

    const validatedPage = Math.max(1, parseInt(page));
    const offset = (validatedPage - 1) * limit;
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("You must be logged in.");

      const res = await fetch(
        `${process.env.API_BASE_URL}/api/searched-user/dtrs/${searchedUserId}?limit=${limit}&offset=${offset}`,
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
            "Failed to get searched user's DTR. Please try again.",
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

export const getSearchedStudentDtrLocation = cache(async (searchedUserId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/set-dtr-location/${searchedUserId}`,
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
          "Failed to get searched user setted location for DTR. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
});

export async function setStudentDtrLocation(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const studentId = formData.studentId;
    const internshipId = formData.internshipId;
    const data = {
      lat: formData.lat,
      lon: formData.lon,
      label: formData.label,
      radius_meter: formData.radius_meter,
      address: formData.address,
    };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/set-dtr-location/${studentId}?internshipId=${internshipId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      },
    );

    if (res.ok) {
      revalidatePath("/users");
    }

    return await res.json();
  } catch (err) {
    console.error("Setting dtr location error: ", err.message);
    return { success: false, error: err.message };
  }
}

export const getInternshipRecordDtr = cache(async (internshipId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/dtr/${internshipId}`,
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
          "Failed to get the internship record's dtr. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
});
