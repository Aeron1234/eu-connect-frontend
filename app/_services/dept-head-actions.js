"use server";

import { revalidatePath } from "next/cache";
// import { getUserSession } from "./services";
import { getAccessToken, getUserSession } from "./auth";
import { cache } from "react";

// To be replaced by update internship records later
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

export async function createAnnouncement(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const announcementData = Object.fromEntries(formData);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/announcement/new`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const announcementId = formData.get("announcementId");
    const is_pinned = formData.get("is_pinned");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/announcements/pin/${announcementId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const announcementData = Object.fromEntries(formData);
    const announcementId = announcementData.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/announcements/${announcementId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const announcementId = formData.get("announcementId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/announcement/${announcementId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${process.env.API_BASE_URL}/api/student-map`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

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

export const getInternshipRecordDtr = cache(async (internshipId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/dtr/${internshipId}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/narratives/${internshipId}`,
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

export const getInternshipRecordDocuments = cache(async (internshipId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/documents/${internshipId}`,
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

export const downloadInternshipRecordDocuments = async (
  prevState,
  formData,
) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const { fileId, internshipId } = formData;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/files/download/${internshipId}/${fileId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
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

/////////////////////////
//PAST INTERNSHIPS
/////////////////////////
export const getAlumniInternships = async ({
  academicYear,
  search = "",
  page = 1,
}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const params = new URLSearchParams({ page: String(page) });
    if (academicYear) params.set("academicYear", academicYear);
    if (search) params.set("search", search);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/alumni-internships?${params.toString()}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const pastRecord = Object.fromEntries(formData);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/alumni-internships`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const recordId = formData.get("recordId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/alumni-internships/${recordId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const recordData = Object.fromEntries(formData);
    const recordId = recordData.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/alumni-internships/${recordId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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

export const getDepartmentHeadDashboardStats = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: "You must be logged in." };
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/department-head-dashboard-stats`,
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
          "Failed to get department head dashboard stats. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get department head dashboard stats error:", err);
    return {
      error: "Failed to get department head dashboard stats. Please try again.",
    };
  }
};

export const getOngoingInternshipsPerCourse = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: "You must be logged in." };
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/ongoing-internships-per-course`,
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
          "Failed to get internships per course. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get ongoing internships per course error:", err);
    return {
      error: "Failed to get internships per course. Please try again.",
    };
  }
};

export const getAverageShiftHours = async ({ month, year } = {}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: "You must be logged in." };
    }

    const params = new URLSearchParams();
    if (month) params.set("month", month);
    if (year) params.set("year", year);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/average-shift-hours?${params.toString()}`,
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
          error.error || "Failed to get average shift hours. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get average shift hours error:", err);
    return { error: "Failed to get average shift hours. Please try again." };
  }
};

export const getAvailableShiftHoursMonths = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: "You must be logged in." };
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/available-shift-hours-months`,
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
          error.error || "Failed to get available months. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get available shift hours months error:", err);
    return { error: "Failed to get available months. Please try again." };
  }
};

export const getStudentEvaluationAverages = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "You must be logged in." };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/student-evaluation-averages`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.error ||
          "Failed to get student evaluation averages. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get student evaluation averages error:", err);
    return {
      error: "Failed to get student evaluation averages. Please try again.",
    };
  }
};

export const getEmployerEvaluationAverages = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "You must be logged in." };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/employer-evaluation-averages`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.error ||
          "Failed to get employer evaluation averages. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get employer evaluation averages error:", err);
    return {
      error: "Failed to get employer evaluation averages. Please try again.",
    };
  }
};

export const getStudentHoursTracker = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "You must be logged in." };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/student-hours-tracker`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.error ||
          "Failed to get student hours tracker. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get student hours tracker error:", err);
    return {
      error: "Failed to get student hours tracker. Please try again.",
    };
  }
};

/////////////////////////
//FOR REGISTRAR
/////////////////////////
export const getAvailableAcademicYears = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/reports/academic-years`,
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
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("You must be logged in.");

      const params = new URLSearchParams({ page: String(page) });
      if (academicYear) params.set("academicYear", academicYear);
      if (search) params.set("search", search);

      const res = await fetch(
        `${process.env.API_BASE_URL}/api/reports/hte-annual/companies?${params.toString()}`,
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
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("You must be logged in.");

      const res = await fetch(
        `${process.env.API_BASE_URL}/api/reports/hte-annual/company?academicYear=${academicYear}&companyKey=${companyKey}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: "You must be logged in." };
    }

    const res = await fetch(`${process.env.API_BASE_URL}/api/reports/annex-c`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

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
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: "You must be logged in." };
    }

    const params = new URLSearchParams({ page: String(page) });
    if (academicYear) params.set("academicYear", academicYear);
    if (search) params.set("search", search);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/reports/annex-c?${params.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
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
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: "You must be logged in." };
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/reports/annex-c/${reportId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
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
