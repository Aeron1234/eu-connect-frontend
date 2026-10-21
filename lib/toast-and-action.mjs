/** Call an action with its real arguments and replace one loading toast. */
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
    const errorOptions = {
      duration: 3000,
      id: toastId,
      style: { backgroundColor: "#FEE2E2", color: "#991B1B" },
    };

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
      if (result?.success) {
        toast.success(result.message || successLabel, {
          duration: 3000,
          id: toastId,
          style: { backgroundColor: "#DCFCE7", color: "#166534" },
        });
      } else {
        toast.error(result?.error || errorLabel, errorOptions);
      }
      return result;
    } catch (error) {
      // Keep callers' catch/onError behavior, but never leave a loading toast.
      toast.error(errorLabel || "Something went wrong. Please try again.", errorOptions);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  };
}
