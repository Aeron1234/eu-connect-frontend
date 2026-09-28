"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "./auth";
import { cache } from "react";

export const getOngoingInternshipRecord = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/active`,
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

    return data || null;
  } catch (err) {
    return null;
  }
});

export async function createInternshipRecord(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${process.env.API_BASE_URL}/api/internships/new`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const data = await res.json();
    if (res.ok) revalidatePath("/student/internship-record");
    return data;
  } catch (err) {
    console.log(err);
    return { success: false, error: err.message };
  }
}

export async function finishInternshipRecord(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const internshipId = formData.get("id");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/finish/${internshipId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data = await res.json();
    if (res.ok) revalidatePath("/student");

    return data;
  } catch (err) {
    console.error("Finish internship record error: ", err.message);
    return { success: false, error: err.message };
  }
}

export const getMyPastInternshipRecords = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/my-past-internships`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
});

export const getInternshipRecords = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${process.env.API_BASE_URL}/api/internships/all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      return { error: error.message || "No internship records found." };
    }

    return await res.json();
  } catch (err) {
    return null;
  }
});

export async function approveInternshipRecord(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const internshipId = formData.get("id");
    const status = formData.get("status");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship/${internshipId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      },
    );

    if (res.ok) {
      revalidatePath("/internship-records");
    }

    return await res.json();
  } catch (err) {
    console.error("Create Record Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function restoreInternshipRecord(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const internshipId = formData.get("id");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/restore/${internshipId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (res.ok) {
      revalidatePath(`$/internship-records/${internshipId}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Restoring Record Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function updateInternshipRecordStatus(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const internshipId = formData.get("id");
    const status = formData.get("status");

    let url;
    let body;

    if (["ongoing", "rejected"].includes(status)) {
      url = `${process.env.API_BASE_URL}/api/internship/${internshipId}`;
      body = { status };
    } else if (status === "pending") {
      // restore a rejected record back to pending
      url = `${process.env.API_BASE_URL}/api/internship-records/${internshipId}/restore`;
      body = null;
    } else if (status === "finished") {
      url = `${process.env.API_BASE_URL}/api/internship-records/${internshipId}/finish`;
      body = null;
    } else {
      return { success: false, error: "Invalid status." };
    }

    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (res.ok) {
      revalidatePath("/internship-records");
    }

    return await res.json();
  } catch (err) {
    console.error("Update internship record status error: ", err.message);
    return { success: false, error: err.message };
  }
}

export const getDepartmentInternshipRecords = async ({
  status = "",
  search = "",
  page = 1,
  limit = 10,
}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const params = new URLSearchParams({
      status,
      search,
      page,
      limit,
    });

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/department?${params.toString()}`,
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
          "Failed to get the internship records. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const getInternshipRecordOverview = cache(async (internshipId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/overview/${internshipId}`,
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
          "Failed to get the internship record's overview. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
});
