"use server";
import { getAccessToken } from "./auth";
import { getApiBaseUrl } from "../api-base-url.mjs";
import { parseApiResponse } from "../api-response";
import { fetchUpload, uploadRequestFailure } from "../upload-request.mjs";
// Use no-store authenticated requests: multipart uploads have a 90-second
// deadline, other feedback operations 25 seconds. Timeouts do not confirm rollback.
async function request(path, options = {}) {
  try {
    const token = await getAccessToken();
    if (!token) return { success: false, error: "Your session has expired. Please log in again." };
    const { headers, ...rest } = options;
    const response = await fetchUpload(getApiBaseUrl() + "/feedback" + path, {
      ...rest, cache: "no-store", headers: { Authorization: "Bearer " + token, ...headers },
    }, { timeoutMs: options.body instanceof FormData ? 90000 : 25000 });
    return { ...await parseApiResponse(response), statusCode: response.status };
  } catch (error) {
    if (options.body instanceof FormData) return uploadRequestFailure(error);
    return { success: false, error: error?.name === "TimeoutError" || error?.name === "AbortError" ? "The request timed out. Refresh this page before trying again." : "Could not reach the server. Please try again." };
  }
}
export async function getFeedbackFeed(filters) {
  return request("?" + new URLSearchParams({ page: String(filters.page || 1), category: filters.category || "all", status: filters.status || "all", search: filters.search || "" }));
}
export async function getFeedbackDetail(id) { return request("/" + encodeURIComponent(id)); }
export async function getFeedbackInterns() { return request("/interns"); }
export async function createFeedback(formData) { return request("", { method: "POST", body: formData }); }
export async function postFeedbackReply(id, body, isInternal = false) {
  return request("/" + encodeURIComponent(id) + "/replies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body, isInternal }) });
}
export async function changeFeedbackStatus(id, status) {
  return request("/" + encodeURIComponent(id) + "/status", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
}
export async function getOlderFeedbackReplies(id, before) {
  return request("/" + encodeURIComponent(id) + "/replies?before=" + encodeURIComponent(before));
}

export async function updateFeedback(id, formData) { return request("/" + encodeURIComponent(id), { method: "PATCH", body: formData }); }
export async function deleteFeedback(id) { return request("/" + encodeURIComponent(id), { method: "DELETE" }); }
export async function updateFeedbackReply(id, replyId, body) {
  return request("/" + encodeURIComponent(id) + "/replies/" + encodeURIComponent(replyId), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
}
export async function deleteFeedbackReply(id, replyId) { return request("/" + encodeURIComponent(id) + "/replies/" + encodeURIComponent(replyId), { method: "DELETE" }); }
