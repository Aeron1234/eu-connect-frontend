"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken, getUserSession } from "./auth";
import { cache } from "react";
import { parseApiResponse, throwApiError, toReadActionResult } from "../api-response";

export async function respondToStudentEvaluation(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

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
        body: JSON.stringify({ decision }),
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/student/evaluations");
    return result;
  } catch (err) {
    console.error("respondToStudentEvaluation failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function restoreDisputedEvaluation(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

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

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/student/evaluations");
    return result;
  } catch (err) {
    console.error("restoreDisputedEvaluation failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
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
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
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
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
});

export async function postEmployerEvaluation(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    // NOTE: reads formData as a plain object, not formData.get(...) —
    // caller must be passing a plain object here, not a FormData instance.
    const { scores, other_remarks } = formData;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/evaluations/employer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ scores, other_remarks }),
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/student/evaluations");
    return result;
  } catch (err) {
    console.error("postEmployerEvaluation failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
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
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
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
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
});

export const getAllEvaluations = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${process.env.API_BASE_URL}/api/evaluations/all`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
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
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
});

export async function postStudentEvaluation(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const session = await getUserSession(); // adjust to whatever your app already uses elsewhere (e.g. the same helper DashboardLayout components call)
    const evaluated_by = session?.user?.id;

    if (!evaluated_by) {
      return { success: false, error: "You must be logged in." };
    }

    // NOTE: reads formData as a plain object, not formData.get(...) —
    // same pattern as postEmployerEvaluation above.
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

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/users");
    return result;
  } catch (err) {
    console.error("postStudentEvaluation failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function deletePendingStudentEvaluation(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

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

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/users");
    return result;
  } catch (err) {
    console.error("deletePendingStudentEvaluation failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
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
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
});

export async function restoreInternshipRecordEvaluations(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

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

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/internship-records");
    return result;
  } catch (err) {
    console.error("restoreInternshipRecordEvaluations failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function reviewDisputedEvaluation(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

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

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/internship-records");
    return result;
  } catch (err) {
    console.error("reviewDisputedEvaluation failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export const getAllEvaluationCriteria = cache(async ({ type = "employer" }) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    if (!["student", "employer"].includes(type)) {
      throw new Error("Evaluations is for student and employers only.");
    }

    const API_ROUTE =
      type === "student"
        ? "criteria/student-evaluation"
        : "criteria/employer-evaluation";

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/${API_ROUTE}?includeInactive=true`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) await throwApiError(res);

    const data = await res.json();
    return data || [];
  } catch (error) {
    throw error;
  }
});

export async function addCriterion(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const type = formData.get("type");
    const category = formData.get("category");
    const criterion_name = formData.get("criterion_name");

    if (!["student", "employer"].includes(type)) {
      return {
        success: false,
        error: "Evaluations is for student and employers only.",
      };
    }

    const API_ROUTE =
      type === "student"
        ? "criteria/student-evaluation"
        : "criteria/employer-evaluation";

    const res = await fetch(`${process.env.API_BASE_URL}/api/${API_ROUTE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ category, criterion_name }),
    });

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/admin/evaluation-criteria");
    return result;
  } catch (error) {
    console.error("addCriterion failed:", error);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function deactivateCriterion(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const criterionId = formData.get("id");
    const type = formData.get("type");

    if (!["student", "employer"].includes(type)) {
      return {
        success: false,
        error: "Evaluations is for student and employers only.",
      };
    }

    const API_ROUTE =
      type === "student"
        ? "criteria/student-evaluation"
        : "criteria/employer-evaluation";

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

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/admin/evaluation-criteria");
    return result;
  } catch (err) {
    console.error("deactivateCriterion failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function reactivateCriterion(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const criterionId = formData.get("id");
    const type = formData.get("type");

    if (!["student", "employer"].includes(type)) {
      return {
        success: false,
        error: "Evaluations is for student and employers only.",
      };
    }

    const API_ROUTE =
      type === "student"
        ? `criteria/student-evaluation/${criterionId}/reactivate`
        : `criteria/employer-evaluation/${criterionId}/reactivate`;

    const res = await fetch(`${process.env.API_BASE_URL}/api/${API_ROUTE}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/admin/evaluation-criteria");
    return result;
  } catch (err) {
    console.error("reactivateCriterion failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function deactivateSection(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const category = formData.get("category");
    const type = formData.get("type");

    if (!["student", "employer"].includes(type)) {
      return {
        success: false,
        error: "Evaluations is for student and employers only.",
      };
    }

    const API_ROUTE =
      type === "student"
        ? "criteria/student-evaluation/section"
        : "criteria/employer-evaluation/section";

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

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/admin/evaluation-criteria");
    return result;
  } catch (err) {
    console.error("deactivateSection failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function reactivateSection(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const category = formData.get("category");
    const type = formData.get("type");

    if (!["student", "employer"].includes(type)) {
      return {
        success: false,
        error: "Evaluations is for student and employers only.",
      };
    }

    // FIXED: was `criteria/{type}-evaluation/${category}/deactivate`, which
    // is missing the `/section/` segment and used the wrong verb — it
    // matched no route on the Express side (404 every time). The real
    // route is PATCH /criteria/{type}-evaluation/section/:category/reactivate.
    const API_ROUTE =
      type === "student"
        ? "criteria/student-evaluation/section"
        : "criteria/employer-evaluation/section";

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

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/admin/evaluation-criteria");
    return result;
  } catch (err) {
    console.error("reactivateSection failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}


// Client interactions receive a serializable error; page reads throw.
export async function getAllEvaluationCriteriaResult(...args) {
  return toReadActionResult(getAllEvaluationCriteria, args);
}

export async function getAllEvaluationsResult(...args) {
  return toReadActionResult(getAllEvaluations, args);
}

export async function getDisputedEvaluationsResult(...args) {
  return toReadActionResult(getDisputedEvaluations, args);
}

export async function getEmployerEvaluationCriteriasResult(...args) {
  return toReadActionResult(getEmployerEvaluationCriterias, args);
}

export async function getInternshipRecordEvaluationsResult(...args) {
  return toReadActionResult(getInternshipRecordEvaluations, args);
}

export async function getStudentEvaluationCriteriasResult(...args) {
  return toReadActionResult(getStudentEvaluationCriterias, args);
}

export async function getStudentPastEvaluationsResult(...args) {
  return toReadActionResult(getStudentPastEvaluations, args);
}

export async function getStudentPendingEvaluationsResult(...args) {
  return toReadActionResult(getStudentPendingEvaluations, args);
}
