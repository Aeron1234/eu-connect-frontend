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

export async function setSearchedStudentDtrLocation(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["employer"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const searchedUserId = formData.searchedUserId;
    const internshipId = formData.internshipId;
    const data = {
      lat: formData.lat,
      lon: formData.lon,
      label: formData.label,
      radius_meters: formData.radius,
    };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/set-dtr-location/${searchedUserId}?userId=${userId}&internshipId=${internshipId}`,
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
