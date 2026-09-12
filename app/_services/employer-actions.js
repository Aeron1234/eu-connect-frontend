"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "./auth";
import { cache } from "react";
// import { getUserSession } from "./services";

export async function postStudentEvaluation(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const { scores, other_remarks, student_id } = formData;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/student-evaluation/new`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          scores,
          other_remarks,
          student_id,
        }),
      },
    );

    if (res.ok) {
      revalidatePath("/users");
    }

    return await res.json();
  } catch (err) {
    console.error("Post student evaluation error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function deletePendingStudentEvaluation(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const evaluation_id = formData.get("evaluationId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/student-evaluation/${evaluation_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (res.ok) {
      revalidatePath("/users");
    }

    return await res.json();
  } catch (err) {
    console.error("Delete pending student evaluation error: ", err.message);
    return { success: false, error: err.message };
  }
}

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

export async function uploadCertificateOfCompletion(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const searchedUserId = formData.get("searchedUserId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/files/${searchedUserId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // no Content-Type — fetch sets multipart/form-data with the
          // correct boundary automatically when body is a FormData instance
        },
        body: formData,
      },
    );

    if (res.ok) {
      revalidatePath("/users");
    }

    return await res.json();
  } catch (err) {
    console.error("Upload certificate error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteEmployerCertificate(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const searchedUserId = formData.get("searchedUserId");
    const fileId = formData.get("fileId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/files/${fileId}/${searchedUserId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (res.ok) {
      revalidatePath("/users");
    }

    return await res.json();
  } catch (err) {
    console.error("Delete pending student evaluation error: ", err.message);
    return { success: false, error: err.message };
  }
}

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
      revalidatePath("/users");
    }

    return await res.json();
  } catch (err) {
    console.error("Delete pending student evaluation error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function respondToSupervisorRequest(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const requestId = formData.get("requestId");
    const decision = formData.get("decision");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/supervisor-requests/respond/${requestId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ decision }),
      },
    );

    const data = await res.json();
    if (res.ok) revalidatePath("/notifications");

    return data;
  } catch (err) {
    console.log(err);
    return { success: false, error: err.message };
  }
}

export const getSupervisedInterns = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: "You must be logged in." };
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/supervised-interns`,
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
          error.error || "Failed to get supervised interns. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get supervised interns error:", err);
    return { error: "Failed to get supervised interns. Please try again." };
  }
};

export const getPostedJobs = cache(async ({ page = 1 } = {}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/posted-jobs?page=${page}`,
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
        error: error.error || "Failed to get posted jobs. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get posted jobs error:", err);
    return { error: "Failed to get posted jobs. Please try again." };
  }
});

export const getEmployerDashboardStats = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: "You must be logged in." };
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/employer-dashboard-stats`,
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
          error.error ||
          "Failed to get employer dashboard stats. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get employer dashboard stats error:", err);
    return {
      error: "Failed to get employer dashboard stats. Please try again.",
    };
  }
};
