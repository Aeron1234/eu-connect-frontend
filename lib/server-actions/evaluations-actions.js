"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken, getUserSession } from "./auth";
import { cache } from "react";

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

export const getStudentEvaluationCriterias = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/student-evaluation/criteria`,
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
          "Failed to get evaluation criterias. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const getStudentPastEvaluations = cache(async (searchedUserId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/student-past-evaluations/${searchedUserId}`,
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
          "Failed to get more notifications. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.log(err);
    return null;
  }
});

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

export const getEmployerEvaluationCriterias = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/evaluation-criterias`,
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
          "Failed to get evaluation criterias. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const getStudentPendingEvaluations = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/evaluations/pending`,
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
          "Failed to get pending evaluations. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const getAllEvaluations = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${process.env.API_BASE_URL}/api/evaluations/all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.message || "Failed to get all evaluations. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const getDisputedEvaluations = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/evaluations/disputed`,
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
          "Failed to get disputed evaluations. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.log(err);
    return null;
  }
});

export async function postStudentEvaluation(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const session = await getUserSession(); // adjust to whatever your app already uses elsewhere (e.g. the same helper DashboardLayout components call)
    const evaluated_by = session?.user?.id;

    if (!evaluated_by) throw new Error("You must be logged in");

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
          evaluated_by,
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

export const getInternshipRecordEvaluations = cache(async (internshipId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/evaluations/${internshipId}`,
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
          "Failed to get the internship record's evaluations. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
});

export async function restoreInternshipRecordEvaluations(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const evaluationId = formData.get("evaluationId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/restore/${evaluationId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (res.ok) {
      revalidatePath(`/internship-records`);
    }

    return await res.json();
  } catch (err) {
    console.error("Restoring evaluation error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function reviewDisputedEvaluation(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const evaluationId = formData.get("evaluationId");
    const review_notes = formData.get("review_notes");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/evaluations/review/${evaluationId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ review_notes }),
      },
    );

    if (res.ok) {
      revalidatePath("/internship-records");
    }

    return await res.json();
  } catch (err) {
    console.error("Restoring evaluation error: ", err.message);
    return { success: false, error: err.message };
  }
}

export const getAllEvaluationCriteria = cache(async ({ type = "employer" }) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    if (!["student", "employer"].includes(type)) {
      throw new Error("Evaluations is for student and employers only.");
    }

    let API_ROUTE = "";
    if (type === "student") {
      API_ROUTE = "criteria/student-evaluation";
    } else {
      API_ROUTE = "criteria/employer-evaluation";
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/${API_ROUTE}?includeInactive=true`,
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
          error.message ||
          "Failed to fetch evaluation criteria.",
      };
    }

    const data = await res.json();

    return data || [];
  } catch (err) {
    // Normalized to the same { error } shape as the !res.ok branch above,
    // so callers only ever need to check one shape instead of three.
    return { error: err.message || "Failed to fetch evaluation criteria." };
  }
});

export async function addCriterion(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const type = formData.get("type");
    const category = formData.get("category");
    const criterion_name = formData.get("criterion_name");

    if (!["student", "employer"].includes(type)) {
      throw new Error("Evaluations is for student and employers only.");
    }

    let API_ROUTE = "";
    if (type === "student") {
      API_ROUTE = "criteria/student-evaluation";
    } else {
      API_ROUTE = "criteria/employer-evaluation";
    }

    const res = await fetch(`${process.env.API_BASE_URL}/api/${API_ROUTE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ category, criterion_name }),
    });

    if (!res.ok) {
      const error = await res.json();
      return {
        error: error.error || error.message || "Failed to add new criterion.",
      };
    }

    revalidatePath("/admin/evaluation-criteria");
    return await res.json();
  } catch (error) {
    console.error("Add criterion error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function deactivateCriterion(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const criterionId = formData.get("id");
    const type = formData.get("type");

    if (!["student", "employer"].includes(type)) {
      throw new Error("Evaluations is for student and employers only.");
    }

    let API_ROUTE = "";
    if (type === "student") {
      API_ROUTE = "criteria/student-evaluation";
    } else {
      API_ROUTE = "criteria/employer-evaluation";
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/${API_ROUTE}/${criterionId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data = await res.json();

    if (res.ok) {
      revalidatePath("/admin/evaluation-criteria");
    }

    return data;
  } catch (err) {
    console.error("Deactivate criterion error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function reactivateCriterion(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const criterionId = formData.get("id");
    const type = formData.get("type");

    if (!["student", "employer"].includes(type)) {
      throw new Error("Evaluations is for student and employers only.");
    }

    let API_ROUTE = "";
    if (type === "student") {
      API_ROUTE = `criteria/student-evaluation/${criterionId}/reactivate`;
    } else {
      API_ROUTE = `criteria/employer-evaluation/${criterionId}/reactivate`;
    }

    const res = await fetch(`${process.env.API_BASE_URL}/api/${API_ROUTE}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();

    if (res.ok) {
      revalidatePath("/admin/evaluation-criteria");
    }

    return data;
  } catch (err) {
    console.error("Reactivate criterion error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function deactivateSection(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const category = formData.get("category");
    const type = formData.get("type");

    if (!["student", "employer"].includes(type)) {
      throw new Error("Evaluations is for student and employers only.");
    }

    let API_ROUTE = "";
    if (type === "student") {
      API_ROUTE = "criteria/student-evaluation/section";
    } else {
      API_ROUTE = "criteria/employer-evaluation/section";
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/${API_ROUTE}/${encodeURIComponent(category)}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data = await res.json();

    if (res.ok) {
      revalidatePath("/admin/evaluation-criteria");
    }

    return data;
  } catch (err) {
    console.error("Deactivate section error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function reactivateSection(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const category = formData.get("category");
    const type = formData.get("type");

    if (!["student", "employer"].includes(type)) {
      throw new Error("Evaluations is for student and employers only.");
    }

    // FIXED: was `criteria/{type}-evaluation/${category}/deactivate`, which
    // is missing the `/section/` segment and used the wrong verb — it
    // matched no route on the Express side (404 every time). The real
    // route is PATCH /criteria/{type}-evaluation/section/:category/reactivate.
    let API_ROUTE = "";
    if (type === "student") {
      API_ROUTE = "criteria/student-evaluation/section";
    } else {
      API_ROUTE = "criteria/employer-evaluation/section";
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/${API_ROUTE}/${encodeURIComponent(category)}/reactivate`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data = await res.json();

    if (res.ok) {
      revalidatePath("/admin/evaluation-criteria");
    }

    return data;
  } catch (err) {
    console.error("Reactivate section error:", err.message);
    return { success: false, error: err.message };
  }
}
