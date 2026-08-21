"use server";

import { db } from "@/lib/db";
import { signIn, signOut } from "./auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getTodayDtr,
  getOngoingInternshipRecord,
  getUserSession,
} from "./services";
import { AuthError } from "next-auth";

////////////////////////////////////////////////////
// AUTHENTICATION
////////////////////////////////////////////////////

export async function login(prevState, formData) {
  const username = formData.get("username");

  //Validate email safely
  if (!username || typeof username !== "string") {
    return { error: "Username is required." };
  }

  const usernameRegex = /^\S+$/;
  if (!usernameRegex.test(username)) {
    return { error: "Invalid username format." };
  }

  try {
    await signIn("credentials", {
      ...Object.fromEntries(formData),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Access the code you passed in the authorize function
      const errorCode = error.cause?.err?.code || error.code;

      if (errorCode === "inactive_account") {
        return {
          error: "This account has been deactivated. Please contact the Admin.",
        };
      }

      if (error.type === "CredentialsSignin") {
        return { error: "Invalid username or password." };
      }

      return { error: "Something went wrong during sign in." };
    }

    // This re-throws the error if it's a redirect (success case)
    throw error;
  }

  redirect("/");
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

////////////////////////////////////////////////////
//INTERNSHIP RECORDS
////////////////////////////////////////////////////
export async function createInternshipRecord(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["student", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const internshipRecordData = Object.fromEntries(formData);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/new?userId=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: JSON.stringify(internshipRecordData),
      },
    );

    if (res.ok) {
      revalidatePath("/student/internship-record");
    }

    return await res.json();
  } catch (err) {
    console.error("Create Record Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function finishInternshipRecord(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["student", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const internshipId = formData.get("id");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/finish/${internshipId}?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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

////////////////////////////////////////////////////
// DAILY TIME RECORDS
////////////////////////////////////////////////////
export async function getDtrs(page = 1) {
  const limit = 5;

  const validatedPage = Math.max(1, parseInt(page));
  const offset = (validatedPage - 1) * limit;

  try {
    const session = await getUserSession();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    const internship = await getOngoingInternshipRecord();
    if (!internship) return null;

    const internshipId = internship.id;
    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/dtr/history?userId=${userId}&internshipId=${internshipId}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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
}

export async function clockIn(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    // 1. Check if they have an internship
    const internship = await getOngoingInternshipRecord();
    if (!internship) throw new Error("No ongoing internship found.");

    const userId = session.user.id;
    const internshipId = internship.id;

    const lat_in = formData.get("lat_in");
    const lon_in = formData.get("lon_in");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/dtr/clock-in?userId=${userId}&internshipId=${internshipId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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
    const session = await getUserSession();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData) throw new Error("No ongoing internship found.");

    const userId = session.user.id;
    const internshipId = internshipData.id;

    const lat_out = formData.get("lat_out");
    const lon_out = formData.get("lon_out");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/dtr/clock-out?userId=${userId}&internshipId=${internshipId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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
    const session = await getUserSession();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    if (!formData || typeof formData.get !== "function") {
      throw new Error("Invalid form submission.");
    }

    const userId = session.user.id;
    const dtrId = Number(formData.get("dtrId"));

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/dtr/${dtrId}?userId=${userId}`,
      {
        method: "DELETE",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    const data = await res.json();
    if (res.ok) revalidatePath("/student");

    return data;
  } catch (err) {
    console.error("Delete Error:", err.message);
    return { success: false, error: err.message };
  }
}

////////////////////////////////////////////////////
// DAILY NARRATIVES
////////////////////////////////////////////////////
export async function getDailyNarratives() {
  try {
    const session = await getUserSession();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    const internship = await getOngoingInternshipRecord();
    if (!internship) return null;

    const userId = session.user.id;
    const internshipId = internship.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/narratives/history?userId=${userId}&internshipId=${internshipId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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
    console.log(err);
    return null;
  }
}

export async function fetchMoreDailyNarratives({ page }) {
  try {
    const session = await getUserSession();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    const internship = await getOngoingInternshipRecord();
    if (!internship) return null;

    const userId = session.user.id;
    const internshipId = internship.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/narratives/history?userId=${userId}&internshipId=${internshipId}&page=${page}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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
    console.log(err);
    return null;
  }
}

export async function createNarrative(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    if (!formData || typeof formData.get !== "function") {
      throw new Error("Invalid form submission.");
    }

    const narrativeData = Object.fromEntries(formData);

    const internship = await getOngoingInternshipRecord();
    if (!internship) throw new Error("No ongoing internship found.");

    const userId = session.user.id;
    const internshipId = internship.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/narratives/new?userId=${userId}&internshipId=${internshipId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: JSON.stringify(narrativeData),
      },
    );

    const data = await res.json();
    if (res.ok) revalidatePath("/student/narratives");

    return data;
  } catch (err) {
    console.log(err);
    return { success: false, error: err.message };
  }
}

export async function editNarrative(narrativeId, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    if (!formData || typeof formData.get !== "function") {
      throw new Error("Invalid form submission.");
    }

    const internship = await getOngoingInternshipRecord();
    if (!internship) throw new Error("No ongoing internship found.");

    const internshipId = internship.id;
    const userId = session.user.id;
    const narrativeData = Object.fromEntries(formData);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/narratives/${narrativeId}?userId=${userId}&internshipId=${internshipId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: JSON.stringify(narrativeData),
      },
    );

    const data = await res.json();
    if (res.ok) revalidatePath("/student/narratives");

    return data;
  } catch (err) {
    console.log(err);
    return { success: false, error: err.message };
  }
}

export async function deleteNarrative(prevState, formData) {
  // Added prevState for useActionState compatibility
  const connection = await db.getConnection();

  try {
    const session = await getUserSession();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    if (!formData || typeof formData.get !== "function") {
      throw new Error("Invalid form submission.");
    }

    const narrativeId = Number(formData.get("narrativeId"));
    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/narratives/${narrativeId}?userId=${userId}`,
      {
        method: "DELETE",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    const data = await res.json();
    if (res.ok) revalidatePath("/student/narratives");

    return data;
  } catch (err) {
    await connection.rollback();
    console.error("Delete Error:", err.message);
    return { success: false, error: err.message };
  } finally {
    connection.release();
  }
}

////////////////////////////////////////////////////
// STORAGE
////////////////////////////////////////////////////
export async function uploadInternshipFile(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }
    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/files/new?userId=${userId}`,
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: formData,
      },
    );

    const data = await res.json();
    if (res.ok) revalidatePath("/student/storage");

    return data;
  } catch (err) {
    console.log(err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteFile(prevState, formData) {
  // Added prevState for useActionState compatibility

  try {
    const session = await getUserSession();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    if (!formData || typeof formData.get !== "function") {
      throw new Error("Invalid form submission.");
    }

    const userId = session.user.id;
    const fileId = Number(formData.get("fileId"));
    // const filePath = formData.get("filePath");

    // if (!fileId || !filePath) throw new Error("Missing file information.");

    // const encodedPath = encodeURIComponent(filePath);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/file/${fileId}?userId=${userId}`,
      {
        method: "DELETE",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    const data = await res.json();
    if (res.ok) revalidatePath("/student/storage");

    return data;
  } catch (err) {
    console.error("Delete Error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function toggleInternshipFavorite(postingId) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["student"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-postings/toggle-favorite/${postingId}?userId=${userId}`,
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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

export async function requestSupervisor(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    if (!["student"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const userId = session.user.id;
    const employerId = formData.get("employerId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/supervisor-requests?userId=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: JSON.stringify({ employerId }),
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        success: false,
        error: error.error || "Failed to send request.",
      };
    }

    return await res.json(); // { success, message, id }
  } catch (err) {
    console.error("Request supervisor error:", err);
    return { success: false, error: "Failed to send request." };
  }
}

export async function cancelSupervisorRequest(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    if (!["student"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const userId = session.user.id;
    const requestId = formData.get("requestId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/supervisor-requests/${requestId}?userId=${userId}`,
      {
        method: "DELETE",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        success: false,
        error: error.error || "Failed to cancel request.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Cancel supervisor request error:", err);
    return { success: false, error: "Failed to cancel request." };
  }
}

export async function postEmployerEvaluation(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["student"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const { scores, other_remarks } = formData;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/evaluations/employer?userId=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: JSON.stringify({
          scores,
          other_remarks,
        }),
      },
    );

    if (res.ok) {
      revalidatePath("/student/evaluations");
    }

    return await res.json();
  } catch (err) {
    console.error("Post evaluation evaluation error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function respondToStudentEvaluation(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["student"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const evaluationId = formData.get("evaluationId");
    const decision = formData.get("decision");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/evaluations/respond/${evaluationId}?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: JSON.stringify({
          decision,
        }),
      },
    );

    if (res.ok) {
      revalidatePath("/student/evaluations");
    }

    return await res.json();
  } catch (err) {
    console.error("Updating evaluation status error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function restoreDisputedEvaluation(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["student"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const evaluationId = formData.get("evaluationId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/evaluations/restore/${evaluationId}?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    if (res.ok) {
      revalidatePath("/student/evaluations");
    }

    return await res.json();
  } catch (err) {
    console.error("Restoring evaluation error: ", err.message);
    return { success: false, error: err.message };
  }
}
