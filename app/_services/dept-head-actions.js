"use server";

import { revalidatePath } from "next/cache";
import { getUserSession } from "./services";
import { cache } from "react";

// To be replaced by update internship records later
export async function approveInternshipRecord(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["department_head", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const internshipId = formData.get("id");
    const status = formData.get("status");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship/${internshipId}?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: JSON.stringify({ status }),
      },
    );

    if (res.ok) {
      revalidatePath("/internship-record");
    }

    return await res.json();
  } catch (err) {
    console.error("Create Record Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function restoreInternshipRecord(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["department_head", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const internshipId = formData.get("id");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/restore/${internshipId}?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    if (res.ok) {
      revalidatePath(`$/internship-record/${internshipId}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Restoring Record Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function updateInternshipRecordStatus(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["department_head", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const internshipId = formData.get("id");
    const status = formData.get("status");

    let url;
    let body;

    if (["ongoing", "rejected"].includes(status)) {
      url = `${process.env.API_BASE_URL}/api/internship/${internshipId}?userId=${userId}`;
      body = { status };
    } else if (status === "pending") {
      // restore a rejected record back to pending
      url = `${process.env.API_BASE_URL}/api/internship-records/${internshipId}/restore?userId=${userId}`;
      body = null;
    } else if (status === "finished") {
      url = `${process.env.API_BASE_URL}/api/internship-records/${internshipId}/finish?userId=${userId}`;
      body = null;
    } else {
      return { success: false, error: "Invalid status." };
    }

    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.BACKEND_SECRET_KEY,
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

export async function createAnnouncement(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["department_head", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const announcementData = Object.fromEntries(formData);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/announcement/new?userId=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: JSON.stringify(announcementData),
      },
    );

    if (res.ok) {
      revalidatePath("/announcements");
    }

    return await res.json();
  } catch (err) {
    console.error("Create Announcement Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function togglePinAnnouncement(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["department_head", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const announcementId = formData.get("announcementId");
    const is_pinned = formData.get("is_pinned");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/announcements/pin/${announcementId}?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: JSON.stringify({ is_pinned }),
      },
    );

    if (res.ok) {
      revalidatePath("/announcements");
    }

    return await res.json();
  } catch (err) {
    console.error("Pin Announcement Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function updateAnnouncement(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["department_head", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const announcementData = Object.fromEntries(formData);
    const announcementId = announcementData.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/announcements/${announcementId}?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: JSON.stringify(announcementData),
      },
    );

    if (res.ok) {
      revalidatePath("/announcements");
    }

    return await res.json();
  } catch (err) {
    console.error("Pin Announcement Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteAnnouncement(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["department_head", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const announcementId = formData.get("announcementId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/announcement/${announcementId}?userId=${userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    if (res.ok) {
      revalidatePath("/announcements");

      revalidatePath("/notifications");
    }

    return await res.json();
  } catch (err) {
    console.error("Delete Announcement Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export const getMapLocations = cache(async () => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["department_head", "admin"].includes(session.user.role)
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/student-map?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.message ||
          "Failed to get the locations of students in the map. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const getDepartmentInternshipRecords = async ({
  status = "",
  search = "",
  page = 1,
  limit = 10,
}) => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["department_head", "admin"].includes(session.user.role)
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const params = new URLSearchParams({
      userId,
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
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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
    const session = await getUserSession();
    if (
      !session?.user ||
      !["department_head", "admin"].includes(session.user.role)
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/overview/${internshipId}?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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

export const getInternshipRecordDtr = cache(async (internshipId) => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["department_head", "admin"].includes(session.user.role)
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/dtr/${internshipId}?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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

export const getInternshipRecordNarratives = cache(async (internshipId) => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["department_head", "admin"].includes(session.user.role)
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/narratives/${internshipId}?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.message ||
          "Failed to get the internship record's narratives. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const getInternshipRecordEvaluations = cache(async (internshipId) => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["department_head", "admin"].includes(session.user.role)
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/evaluations/${internshipId}?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["student"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const evaluationId = formData.get("evaluationId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/restore/${evaluationId}?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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

export const getInternshipRecordDocuments = cache(async (internshipId) => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["department_head", "admin"].includes(session.user.role)
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/documents/${internshipId}?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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

export const downloadInternshipRecordDocuments = async (
  prevState,
  formData,
) => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["department_head", "admin"].includes(session.user.role)
    ) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    const { fileId, internshipId } = formData;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/files/download/${internshipId}/${fileId}?userId=${userId}`,
      {
        method: "GET",
        headers: { "x-api-key": process.env.BACKEND_SECRET_KEY },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        success: false,
        error:
          error.error || "Failed to open / download file. Please try again.",
      };
    }

    const data = await res.json();
    return {
      success: true,
      url: data.url,
      fileName: data.fileName,
      message: "File opened / downloaded successfully.",
    };
  } catch (err) {
    console.error("Download searched student file error:", err);
    return {
      success: false,
      error: "Failed to open / download file. Please try again.",
    };
  }
};

export async function reviewDisputedEvaluation(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["department_head", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const evaluationId = formData.get("evaluationId");
    const review_notes = formData.get("review_notes");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/evaluations/review/${evaluationId}?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
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

/////////////////////////
//PAST INTERNSHIPS
/////////////////////////
export const getAlumniInternships = async ({
  academicYear,
  search = "",
  page = 1,
}) => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["student", "department_head", "admin"].includes(session.user.role)
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const params = new URLSearchParams({ userId, page: String(page) });
    if (academicYear) params.set("academicYear", academicYear);
    if (search) params.set("search", search);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/alumni-internships?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.message ||
          "Failed to get past internship records of alumni. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export async function postAlumniRecord(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["department_head"].includes(session.user.role))
      throw new Error("Unauthorized.");

    const pastRecord = Object.fromEntries(formData);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/alumni-internships?userId=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: JSON.stringify(pastRecord),
      },
    );

    if (res.ok) {
      revalidatePath("/past-internships");
    }

    return await res.json();
  } catch (err) {
    console.error("Create alumni record error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteAlumniRecord(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["department_head", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const recordId = formData.get("recordId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/alumni-internships/${recordId}?userId=${userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    if (res.ok) {
      revalidatePath("/past-internships");
    }

    return await res.json();
  } catch (err) {
    console.error("Delete record error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function updateAlumniRecord(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["department_head", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const recordData = Object.fromEntries(formData);
    const recordId = recordData.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/alumni-internships/${recordId}?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: JSON.stringify(recordData),
      },
    );

    if (res.ok) {
      revalidatePath("/announcements");
    }

    return await res.json();
  } catch (err) {
    console.error("Pin Announcement Error: ", err.message);
    return { success: false, error: err.message };
  }
}

/////////////////////////
//FOR REGISTRAR
/////////////////////////
export const getAvailableAcademicYears = cache(async () => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["department_head", "admin"].includes(session.user.role)
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/reports/academic-years?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.message ||
          "Failed to get available academic year. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const getHteCompanyList = cache(
  async ({ academicYear = "", search = "", page = 1 }) => {
    try {
      const session = await getUserSession();
      if (
        !session?.user ||
        !["department_head", "admin"].includes(session.user.role)
      ) {
        throw new Error("Unauthorized");
      }

      const userId = session.user.id;

      const params = new URLSearchParams({ userId, page: String(page) });
      if (academicYear) params.set("academicYear", academicYear);
      if (search) params.set("search", search);

      const res = await fetch(
        `${process.env.API_BASE_URL}/api/reports/hte-annual/companies?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "x-api-key": process.env.BACKEND_SECRET_KEY,
          },
        },
      );

      if (!res.ok) {
        const error = await res.json();
        return {
          error:
            error.error || "Failed to get HTE company list. Please try again.",
        };
      }

      return await res.json();
    } catch (err) {
      console.error(err);
      return { error: "Unexpected error while loading HTE reports." };
    }
  },
);

export const getHteCompanyReport = cache(
  async ({ academicYear, companyKey }) => {
    try {
      const session = await getUserSession();
      if (
        !session?.user ||
        !["department_head", "admin"].includes(session.user.role)
      ) {
        throw new Error("Unauthorized");
      }

      const userId = session.user.id;

      const res = await fetch(
        `${process.env.API_BASE_URL}/api/reports/hte-annual/company?userId=${userId}&academicYear=${academicYear}&companyKey=${companyKey}`,
        {
          method: "GET",
          headers: {
            "x-api-key": process.env.BACKEND_SECRET_KEY,
          },
        },
      );

      if (!res.ok) {
        const error = await res.json();
        return {
          error:
            error.message ||
            "Failed to get HTE company list. Please try again.",
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

export const saveAnnexCReport = async (payload) => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["department_head", "admin"].includes(session.user.role)
    ) {
      return { error: "Unauthorized" };
    }
    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/reports/annex-c?userId=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return { error: error.error || "Failed to save Annex C report." };
    }

    return await res.json();
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while saving Annex C report." };
  }
};

export const getAnnexCReports = async ({
  academicYear = "",
  search = "",
  page = 1,
} = {}) => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["department_head", "admin"].includes(session.user.role)
    ) {
      return { error: "Unauthorized" };
    }
    const userId = session.user.id;

    const params = new URLSearchParams({ userId, page: String(page) });
    if (academicYear) params.set("academicYear", academicYear);
    if (search) params.set("search", search);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/reports/annex-c?${params.toString()}`,
      { headers: { "x-api-key": process.env.BACKEND_SECRET_KEY } },
    );

    if (!res.ok) {
      const error = await res.json();
      return { error: error.error || "Failed to load Annex C reports." };
    }

    return await res.json();
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while loading Annex C reports." };
  }
};

export const deleteAnnexCReport = async (reportId) => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["department_head", "admin"].includes(session.user.role)
    ) {
      return { error: "Unauthorized" };
    }
    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/reports/annex-c/${reportId}?userId=${userId}`,
      {
        method: "DELETE",
        headers: { "x-api-key": process.env.BACKEND_SECRET_KEY },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return { error: error.error || "Failed to delete report." };
    }

    return await res.json();
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while deleting report." };
  }
};
