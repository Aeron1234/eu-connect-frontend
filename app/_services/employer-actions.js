"use server";

import { revalidatePath } from "next/cache";
import { getUserSession } from "./services";

export async function postStudentEvaluation(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["employer"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const { scores, other_remarks, student_id } = formData;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/student-evaluation/new?userId=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: JSON.stringify({
          scores,
          other_remarks,
          student_id,
          evaluated_by: userId,
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
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["employer"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const evaluation_id = formData.get("evaluationId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/student-evaluation/${evaluation_id}?userId=${userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["employer", "deparment_head", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

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
      `${process.env.API_BASE_URL}/api/searched-user/set-dtr-location/${studentId}?userId=${userId}&internshipId=${internshipId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["employer"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const searchedUserId = formData.get("searchedUserId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/files/${searchedUserId}?userId=${userId}`,
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["employer", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const searchedUserId = formData.get("searchedUserId");
    const fileId = formData.get("fileId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/files/${fileId}/${searchedUserId}?userId=${userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["employer"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const payload = Object.fromEntries(formData.entries());
    payload.course_ids = formData.getAll("course_ids");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-postings?userId=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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
    const session = await getUserSession();
    if (!session?.user || !["employer"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;
    const postingId = formData.get("postingId");
    const payload = Object.fromEntries(formData.entries());
    payload.course_ids = formData.getAll("course_ids");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-postings/${postingId}?userId=${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["employer", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const postingId = formData.get("postingId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-postings/${postingId}?userId=${userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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
    const session = await getUserSession();
    if (!session?.user || session?.user?.role !== "employer") {
      throw new Error("You must be logged in.");
    }

    const userId = session.user.id;
    const requestId = formData.get("requestId");
    const decision = formData.get("decision");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/supervisor-requests/respond/${requestId}?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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
