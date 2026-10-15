/** Call an action with its real arguments and replace one loading toast. */
export function createToastAndAction(toast) {
  return async function toastAndAction({
    loadingLabel = "",
    successLabel = "",
    errorLabel = "",
    action,
    args = [],
  }) {
    const toastId = toast.loading(loadingLabel);
    const errorOptions = {
      duration: 3000,
      id: toastId,
      style: { backgroundColor: "#FEE2E2", color: "#991B1B" },
    };

    try {
      const result = await action(...args);
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
    }
  };
}
