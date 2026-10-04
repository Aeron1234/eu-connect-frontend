// lib/api-response.js

/**
 * Turns a fetch Response into a consistent { success, error, ...data } shape.
 *
 * @param {Response} res - the fetch Response object
 * @returns {Promise<{ success: boolean, error?: string, [key: string]: any }>}
 */
export async function parseApiResponse(res) {
  const data = await readJson(res);

  if (!res.ok) {
    return { success: false, error: formatErrorMessage(res.status, data) };
  }

  // Empty 204/205 responses are successful. Other malformed success bodies
  // must not make a mutation appear successful or trigger revalidation.
  if (res.status === 204 || res.status === 205) return { success: true };
  if (data === null) {
    return {
      success: false,
      error: "Unexpected response from the server. Please try again.",
    };
  }

  if (typeof data !== "object" || Array.isArray(data)) {
    return { success: true, data };
  }

  // Some successful backend writes return { message } without a success flag.
  // Keep every backend field, including an explicit success: false if present.
  return { success: true, ...data };
}

// Read a response body at most once. Proxies and rate limiters may send HTML
// or plain text, so their bodies should never be shown as API error messages.
async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function formatErrorMessage(status, data) {
  const error = nonEmptyString(data?.error);
  const message = nonEmptyString(data?.message);

  switch (status) {
    case 429:
      return (
        error ||
        message ||
        "You're submitting too quickly. Please wait a moment and try again."
      );
    case 401:
      return "Your session has expired. Please log in again.";
    case 403:
      return "You don't have permission to perform this action.";
    default:
      // Backend 400/422 validation failures may use either `error` or
      // `message`. Avoid exposing a 5xx exception's raw `message` to users.
      return (
        error ||
        (status < 500 ? message : null) ||
        `Something went wrong (${status}). Please try again.`
      );
  }
}

/** Format one failed fetch Response. All server-action callers await this. */
export async function getErrorMessage(res) {
  return formatErrorMessage(res.status, await readJson(res));
}

/** Throw a formatted API error while retaining the HTTP status on the server. */
export async function throwApiError(res) {
  const error = new Error(await getErrorMessage(res));
  error.status = res.status;
  throw error;
}

/** Preserve a serializable error contract for client-triggered read actions. */
export async function toReadActionResult(read, args) {
  try {
    return await read(...args);
  } catch (error) {
    const status =
      error?.status || (error?.message === "You must be logged in." ? 401 : 0);
    return {
      error: status
        ? status === 401
          ? "Your session has expired. Please log in again."
          : error.message
        : "Could not reach the server. Please try again.",
      status,
    };
  }
}
