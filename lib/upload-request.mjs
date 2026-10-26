export const UPLOAD_REQUEST_TIMEOUT_MS = 90000;
export const UPLOAD_TIMEOUT_MESSAGE = 'Upload confirmation timed out. Refresh this page before trying again.';

// Bound the upload HTTP request to 90 seconds by default while preserving caller
// cancellation. Aborting the request does not prove the server rolled back its write.
export function fetchUpload(input, options = {}, { fetcher = fetch, timeoutMs = UPLOAD_REQUEST_TIMEOUT_MS } = {}) {
  const timeout = AbortSignal.timeout(timeoutMs);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
  return fetcher(input, { ...options, signal });
}

// Treat aborts/timeouts as unconfirmed outcomes so callers refresh before retrying.
// Other transport failures remain ordinary connection errors.
export function uploadRequestFailure(error) {
  if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
    return { success: false, timedOut: true, error: UPLOAD_TIMEOUT_MESSAGE };
  }
  return { success: false, error: "Couldn't reach the server. Check your connection and try again." };
}
