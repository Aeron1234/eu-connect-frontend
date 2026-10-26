"use server";

import { getApiBaseUrl } from "../api-base-url.mjs";

import { revalidatePath } from "next/cache";
import { getAccessToken, getUserSession } from "./auth";
import { cache } from "react";
import { parseApiResponse, throwApiError, toReadActionResult } from "../api-response";

// Legacy confirmation action retained for compatibility; the current backend
// rejects this retired workflow without changing evaluation state.
export async function respondToStudentEvaluation(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const evaluationId = formData.get("evaluationId");
    const decision = formData.get("decision");

    const res = await fetch(
      `${getApiBaseUrl()}/evaluations/respond/${evaluationId}`,
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

// Legacy dispute action; the current backend rejects it. This is not evaluation
// soft-delete restoration or permission to expose employer scores to students.
export async function restoreDisputedEvaluation(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const evaluationId = formData.get("evaluationId");

    const res = await fetch(
      `${getApiBaseUrl()}/evaluations/restore/${evaluationId}`,
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
      `${getApiBaseUrl()}/student-evaluation/criteria`,
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
      `${getApiBaseUrl()}/student-past-evaluations/${searchedUserId}`,
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

export async function postEmployerEvaluation(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    // The supervisor form supplies a plain score/remarks object despite this
    // parameter's name; criteria-management actions below use native FormData.
    const { scores, other_remarks } = formData;

    const res = await fetch(
      `${getApiBaseUrl()}/evaluations/employer`,
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
      `${getApiBaseUrl()}/evaluation-criterias`,
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

// Legacy pending-confirmation read; the current endpoint denies access.
export const getStudentPendingEvaluations = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${getApiBaseUrl()}/evaluations/pending`,
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

    const res = await fetch(`${getApiBaseUrl()}/evaluations/all`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
});

// Legacy dispute read; the current endpoint denies access.
export const getDisputedEvaluations = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${getApiBaseUrl()}/evaluations/disputed`,
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

export async function postStudentEvaluation(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const session = await getUserSession(); // Resolve the signed-in sender; the backend independently uses its verified user.
    const evaluated_by = session?.user?.id;

    if (!evaluated_by) {
      return { success: false, error: "You must be logged in." };
    }

    // The performance form supplies a plain score/remarks/student object,
    // matching the supervisor form's JSON submission contract.
    const { scores, other_remarks, student_id } = formData;

    const res = await fetch(
      `${getApiBaseUrl()}/student-evaluation/new`,
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

export async function deletePendingStudentEvaluation(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const evaluation_id = formData.get("evaluationId");

    const res = await fetch(
      `${getApiBaseUrl()}/student-evaluation/${evaluation_id}`,
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
      `${getApiBaseUrl()}/internship-records/evaluations/${internshipId}`,
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

export async function restoreInternshipRecordEvaluations(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const evaluationId = formData.get("evaluationId");

    const res = await fetch(
      `${getApiBaseUrl()}/internship-records/restore/${evaluationId}`,
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

export async function reviewDisputedEvaluation(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const evaluationId = formData.get("evaluationId");
    const review_notes = formData.get("review_notes");

    const res = await fetch(
      `${getApiBaseUrl()}/evaluations/review/${evaluationId}`,
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
      `${getApiBaseUrl()}/${API_ROUTE}?includeInactive=true`,
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

export async function addCriterion(formData) {
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

    const res = await fetch(`${getApiBaseUrl()}/${API_ROUTE}`, {
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

export async function deactivateCriterion(formData) {
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
      `${getApiBaseUrl()}/${API_ROUTE}/${criterionId}`,
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

export async function reactivateCriterion(formData) {
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

    const res = await fetch(`${getApiBaseUrl()}/${API_ROUTE}`, {
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

export async function deactivateSection(formData) {
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
      `${getApiBaseUrl()}/${API_ROUTE}/${encodeURIComponent(category)}`,
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

export async function reactivateSection(formData) {
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

    // Section reactivation uses the dedicated PATCH route with an encoded category.
    // It activates every inactive criterion in that section, not only the last batch changed.
    const API_ROUTE =
      type === "student"
        ? "criteria/student-evaluation/section"
        : "criteria/employer-evaluation/section";

    const res = await fetch(
      `${getApiBaseUrl()}/${API_ROUTE}/${encodeURIComponent(category)}/reactivate`,
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

// Route by evaluation direction. The backend chooses author soft deletion or
// staff purge using authenticated permissions and the stored deleted_at state.
export async function deleteEvaluation(formData) {
  try {
    const token = await getAccessToken();
    if (!token) return { success: false, error: 'You must be logged in.' };
    const id = formData.get('evaluationId');
    const type = formData.get('evaluationType');
    if (!['Performance Evaluation', 'Supervisor Evaluation'].includes(type)) return { success: false, error: 'Invalid evaluation type.' };
    const path = type === 'Performance Evaluation' ? '/student-evaluation/' : '/evaluations/employer/';
    const result = await parseApiResponse(await fetch(getApiBaseUrl() + path + encodeURIComponent(id), {
      method: 'DELETE', headers: { Authorization: 'Bearer ' + token }, cache: 'no-store',
    }));
    if (result.success) { revalidatePath('/student/evaluations'); revalidatePath('/users'); revalidatePath('/internship-records'); }
    return result;
  } catch { return { success: false, error: 'Could not delete the evaluation. Try again.' }; }
}

export async function getEvaluationPostingEligibilityResult(direction, studentId) {
  return toReadActionResult(async () => {
    if (!['performance', 'supervisor'].includes(direction)) throw new Error('Invalid evaluation type.');
    const token = await getAccessToken();
    if (!token) throw new Error('You must be logged in.');
    const path = direction === 'performance' ? '/student-evaluation/eligibility/' + encodeURIComponent(studentId) : '/evaluations/eligibility';
    const response = await fetch(getApiBaseUrl() + path, { headers: { Authorization: 'Bearer ' + token }, cache: 'no-store' });
    if (!response.ok) await throwApiError(response);
    return response.json();
  }, []);
}
