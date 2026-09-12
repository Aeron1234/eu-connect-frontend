"use server";

import { db } from "@/lib/db";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getOngoingInternshipRecord,
  // getUserSession
} from "./services";
import { getAccessToken } from "./auth";

////////////////////////////////////////////////////
// AUTHENTICATION
////////////////////////////////////////////////////

// export async function login(prevState, formData) {
//   const username = formData.get("username");

//   //Validate email safely
//   if (!username || typeof username !== "string") {
//     return { error: "Username is required." };
//   }

//   const usernameRegex = /^\S+$/;
//   if (!usernameRegex.test(username)) {
//     return { error: "Invalid username format." };
//   }

//   try {
//     await signIn("credentials", {
//       ...Object.fromEntries(formData),
//       redirect: false,
//     });
//   } catch (error) {
//     if (error instanceof AuthError) {
//       // Access the code you passed in the authorize function
//       const errorCode = error.cause?.err?.code || error.code;

//       if (errorCode === "inactive_account") {
//         return {
//           error: "This account has been deactivated. Please contact the Admin.",
//         };
//       }

//       if (error.type === "CredentialsSignin") {
//         return { error: "Invalid username or password." };
//       }

//       return { error: "Something went wrong during sign in." };
//     }

//     // This re-throws the error if it's a redirect (success case)
//     throw error;
//   }

//   redirect("/");
// }

// export async function logout() {
//   await signOut({ redirectTo: "/login" });
// }

export async function login(prevState, formData) {
  const username = formData.get("username");
  const password = formData.get("password");

  if (!username || typeof username !== "string") {
    return { error: "Username is required." };
  }

  const usernameRegex = /^\S+$/;
  if (!usernameRegex.test(username)) {
    return { error: "Invalid username format." };
  }

  let tokens;
  let mustChangePassword = false;

  try {
    const res = await fetch(`${process.env.API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.error === "inactive_account") {
        return {
          error: "This account has been deactivated. Please contact the Admin.",
        };
      }
      if (data.error === "account_locked") {
        return { error: data.message };
      }
      return { error: data.error || "Invalid username or password." };
    }

    tokens = { accessToken: data.accessToken, refreshToken: data.refreshToken };
    mustChangePassword = !!data.mustChangePassword;
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong during sign in." };
  }

  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  cookieStore.set("access_token", tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });
  cookieStore.set("refresh_token", tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  redirect(mustChangePassword ? "/set-password" : "/");
}

export async function logout() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  try {
    await fetch(`${process.env.API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Manually relaying the refresh token as a Cookie header — this is
        // a server-to-server call, so there's no browser-managed cookie
        // jar to rely on here. cookie-parser on the Express side parses
        // this exactly the same as a real browser-sent cookie.
        ...(refreshToken ? { Cookie: `refresh_token=${refreshToken}` } : {}),
      },
    });
  } catch (error) {
    console.error(error);
  }

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  redirect("/login");
}

export async function forgotPassword(prevState, formData) {
  const email = formData.get("email");

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  try {
    const res = await fetch(
      `${process.env.API_BASE_URL}/api/auth/forgot-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );

    // The backend always returns a generic message regardless of outcome —
    // don't add any branching here that could leak whether the email exists.
    const data = await res.json();
    return { success: true, message: data.message };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function setPassword(prevState, formData) {
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (!newPassword || newPassword.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect("/login");
  }

  try {
    const res = await fetch(
      `${process.env.API_BASE_URL}/api/auth/set-password`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ newPassword }),
      },
    );

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Something went wrong." };
    }

    const cookieStore = await cookies();
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/login");
}

////////////////////////////////////////////////////
//INTERNSHIP RECORDS
////////////////////////////////////////////////////
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

////////////////////////////////////////////////////
// DAILY TIME RECORDS
////////////////////////////////////////////////////
export async function getDtrs(page = 1) {
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
}

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

////////////////////////////////////////////////////
// DAILY NARRATIVES
////////////////////////////////////////////////////
export async function getDailyNarratives() {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const internship = await getOngoingInternshipRecord();
    if (!internship) return null;

    const internshipId = internship.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/narratives/history?internshipId=${internshipId}`,
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
    console.log(err);
    return null;
  }
}

export async function fetchMoreDailyNarratives({ page }) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const internship = await getOngoingInternshipRecord();
    if (!internship) return null;

    const internshipId = internship.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/narratives/history?internshipId=${internshipId}&page=${page}`,
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
    console.log(err);
    return null;
  }
}

export async function createNarrative(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    if (!formData || typeof formData.get !== "function") {
      throw new Error("Invalid form submission.");
    }

    const narrativeData = Object.fromEntries(formData);

    const internship = await getOngoingInternshipRecord();
    if (!internship) throw new Error("No ongoing internship found.");

    const internshipId = internship.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/narratives/new?internshipId=${internshipId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    if (!formData || typeof formData.get !== "function") {
      throw new Error("Invalid form submission.");
    }

    const internship = await getOngoingInternshipRecord();
    if (!internship) throw new Error("No ongoing internship found.");

    const internshipId = internship.id;
    const narrativeData = Object.fromEntries(formData);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/narratives/${narrativeId}?internshipId=${internshipId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    if (!formData || typeof formData.get !== "function") {
      throw new Error("Invalid form submission.");
    }

    const narrativeId = Number(formData.get("narrativeId"));

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/narratives/${narrativeId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/files/new`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
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

export async function approveInternshipDocument(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const fileId = formData.get("fileId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/files/${fileId}/accept`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (res.ok) revalidatePath("/student/storage");

    return await res.json();
  } catch (err) {
    console.error("Accept Document Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteFile(prevState, formData) {
  // Added prevState for useActionState compatibility

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    if (!formData || typeof formData.get !== "function") {
      throw new Error("Invalid form submission.");
    }

    const fileId = Number(formData.get("fileId"));
    // const filePath = formData.get("filePath");

    // if (!fileId || !filePath) throw new Error("Missing file information.");

    // const encodedPath = encodeURIComponent(filePath);

    const res = await fetch(`${process.env.API_BASE_URL}/api/file/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

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

export async function requestSupervisor(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const employerId = formData.get("employerId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/supervisor-requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const requestId = formData.get("requestId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/supervisor-requests/${requestId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const { scores, other_remarks } = formData;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/evaluations/employer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const evaluationId = formData.get("evaluationId");
    const decision = formData.get("decision");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/evaluations/respond/${evaluationId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const evaluationId = formData.get("evaluationId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/evaluations/restore/${evaluationId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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
