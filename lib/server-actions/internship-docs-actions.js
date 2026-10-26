"use server";

import { fetchUpload, uploadRequestFailure } from "../upload-request.mjs";

import { getApiBaseUrl } from "../api-base-url.mjs";
import { revalidatePath } from "next/cache";
import { getAccessToken } from "./auth";
import { cache } from "react";
import { parseApiResponse, getErrorMessage, throwApiError, toReadActionResult } from "../api-response";

// Forward native FormData through the bounded upload request. Leave multipart
// Content-Type to fetch so the request retains its generated boundary.
export async function uploadInternshipFile(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const res = await fetchUpload(
      `${getApiBaseUrl()}/internships/files/new`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/student/storage");
    return result;
  } catch (err) {
    console.error("uploadInternshipFile failed:", err);
    return uploadRequestFailure(err);
  }
}

export async function approveInternshipDocument(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const fileId = formData.get("fileId");

    const res = await fetch(
      `${getApiBaseUrl()}/files/${fileId}/accept`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/student/storage");
    return result;
  } catch (err) {
    console.error("approveInternshipDocument failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function deleteFile(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    if (!formData || typeof formData.get !== "function") {
      return { success: false, error: "Invalid form submission." };
    }

    const fileId = Number(formData.get("fileId"));

    const res = await fetch(`${getApiBaseUrl()}/file/${fileId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/student/storage");
    return result;
  } catch (err) {
    console.error("deleteFile failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export const getFileRequirementTypes = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${getApiBaseUrl()}/internships/files/requirements`,
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

export const getInternshipFiles = cache(
  async ({ internshipId, category = "" }) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("You must be logged in.");

      const res = await fetch(
        `${getApiBaseUrl()}/internships/files?internshipId=${internshipId}&category=${category}`,
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
  },
);

export async function downloadInternshipFile(formData) {
  try {
    const fileId = formData.fileId; // Personal downloads receive a plain { fileId } payload.

    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const res = await fetch(
      `${getApiBaseUrl()}/internships/files/${fileId}/download`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      return { success: false, error: await getErrorMessage(res) };
    }

    const data = await res.json().catch(() => null);
    return {
      success: true,
      url: data?.url,
      fileName: data?.fileName,
      message: "File was opened / downloaded.",
    };
  } catch (err) {
    console.error("Download error:", err);
    return { success: false, error: "Download failed. Please try again." };
  }
}

export const downloadSearchedStudentFiles = async (formData) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const { searchedUserId, fileId } = formData;

    const res = await fetch(
      `${getApiBaseUrl()}/searched-user/files/${fileId}/${searchedUserId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      return { success: false, error: await getErrorMessage(res) };
    }

    const data = await res.json().catch(() => null);
    return {
      success: true,
      url: data?.url,
      fileName: data?.fileName,
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

export const getEmployerUploadedFiles = cache(async (searchedUserId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${getApiBaseUrl()}/searched-user/employer-uploaded-files/${searchedUserId}`,
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

export async function uploadCertificateOfCompletion(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const searchedUserId = formData.get("searchedUserId");

    const res = await fetchUpload(
      `${getApiBaseUrl()}/searched-user/files/${searchedUserId}`,
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

    const result = await parseApiResponse(res);
    // This call retains the literal dynamic-path revalidation target; searchedUserId
    // is available above. The profile's onChanged callback separately refreshes
    // its viewer/target certificate query after a confirmed upload.
    if (result.success) revalidatePath("/users/[userId]");
    return result;
  } catch (err) {
    console.error("uploadCertificateOfCompletion failed:", err);
    return uploadRequestFailure(err);
  }
}

export async function deleteEmployerCertificate(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const searchedUserId = formData.get("searchedUserId");
    const fileId = formData.get("fileId");

    const res = await fetch(
      `${getApiBaseUrl()}/searched-user/files/${fileId}/${searchedUserId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const result = await parseApiResponse(res);
    // Keep the existing dynamic-path revalidation target; the caller also refreshes
    // the target profile's certificate query after a confirmed deletion.
    if (result.success) revalidatePath("/users/[userId]");
    return result;
  } catch (err) {
    console.error("deleteEmployerCertificate failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export const getInternshipRecordDocuments = cache(async (internshipId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${getApiBaseUrl()}/internship-records/documents/${internshipId}`,
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

export const downloadInternshipRecordDocuments = async (formData) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const { fileId, internshipId } = formData;

    const res = await fetch(
      `${getApiBaseUrl()}/internship-records/files/download/${internshipId}/${fileId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      return { success: false, error: await getErrorMessage(res) };
    }

    const data = await res.json().catch(() => null);
    return {
      success: true,
      url: data?.url,
      fileName: data?.fileName,
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


// Client interactions receive a serializable error; page reads throw.
export async function getEmployerUploadedFilesResult(...args) {
  return toReadActionResult(getEmployerUploadedFiles, args);
}

export async function getFileRequirementTypesResult(...args) {
  return toReadActionResult(getFileRequirementTypes, args);
}

export async function getInternshipFilesResult(...args) {
  return toReadActionResult(getInternshipFiles, args);
}

export async function getInternshipRecordDocumentsResult(...args) {
  return toReadActionResult(getInternshipRecordDocuments, args);
}
