/** Shared error feedback for action failures and pre-submit validation. */
export function showActionError(toast, message, options = {}) {
  return toast.error(message, {
    duration: 3000,
    style: { backgroundColor: "#FEE2E2", color: "#991B1B" },
    ...options,
  });
}

/**
 * Run the action with its arguments and replace this call's loading toast on settlement.
 */
export function createToastAndAction(toast) {
  return async function toastAndAction({
    loadingLabel = "",
    successLabel = "",
    errorLabel = "",
    action,
    args = [],
    timeoutMs = 0,
    timeoutLabel = "Request confirmation timed out. Refresh this page before trying again.",
  }) {
    const toastId = toast.loading(loadingLabel);
    const errorOptions = { id: toastId };

    let timeout;
    try {
      const pending = action(...args);
      // Only callers that opt in receive a deadline. A timeout is an unknown
      // outcome, not proof that the server cancelled or rejected the write.
      const result = Number.isFinite(timeoutMs) && timeoutMs > 0
        ? await Promise.race([pending, new Promise(resolve => {
          timeout = setTimeout(() => resolve({ success: false, timedOut: true, error: timeoutLabel }), timeoutMs);
        })])
        : await pending;
      // An opted-in deadline settles this UI wait; it does not cancel the underlying action.
      // Late completion must be reconciled by the feature's refresh rather than a second toast.
      if (result?.success) {
        toast.success(result.message || successLabel, {
          duration: 3000,
          id: toastId,
          style: { backgroundColor: "#DCFCE7", color: "#166534" },
        });
      } else {
        showActionError(toast, result?.error || errorLabel, errorOptions);
      }
      return result;
    } catch (error) {
      // Keep callers' catch/onError behavior, but never leave a loading toast.
      showActionError(toast, errorLabel || "Something went wrong. Please try again.", errorOptions);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  };
}
