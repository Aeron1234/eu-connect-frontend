// GET reads bypass the browser Server Action queue. Abort also covers response bodies.
export async function readRotations(internshipId, { signal } = {}, fetcher = fetch) {
  const deadline = AbortSignal.timeout(25000);
  const combined = signal ? AbortSignal.any([signal, deadline]) : deadline;
  try {
    const response = await fetcher('/api/internship-records/' + encodeURIComponent(internshipId) + '/rotations', {
      method: 'GET', credentials: 'same-origin', cache: 'no-store', signal: combined,
      headers: { Accept: 'application/json' },
    });
    let result;
    try { result = await response.json(); }
    catch {
      if (combined.aborted) throw combined.reason;
      throw Object.assign(new Error('Could not read company rotations. Please retry.'), { status: response.ok ? 502 : response.status });
    }
    if (!response.ok || !result?.success || !Array.isArray(result.rotations)) {
      throw Object.assign(new Error(result?.error || 'Could not load company rotations. Please retry.'), { status: response.ok ? 502 : response.status });
    }
    return result;
  } catch (error) {
    if (signal?.aborted) throw signal.reason;
    if (deadline.aborted) throw Object.assign(new Error('Loading company rotations timed out. Please retry.'), { status: 504 });
    if (error?.status) throw error;
    throw Object.assign(new Error('Could not reach the server for company rotations. Please retry.'), { status: 0 });
  }
}

// Retry reads once for transient network/server failures. Never replay a mutation.
export function retryRotationRead(failureCount, error) {
  return failureCount < 1 && [0, 408, 500, 502, 503, 504].includes(error?.status ?? 0);
}
export function rotationAccessLost(error) {
  return [401, 403, 404].includes(error?.status);
}
