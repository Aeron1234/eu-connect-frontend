// The API toggles a favorite rather than setting it to a requested value.
// Wait for each response before deciding whether another toggle is needed.
export async function reconcileFavoriteToggle({
  getDesired,
  getConfirmed,
  toggle,
  onConfirmed,
  onFailure,
  isActive = () => true,
  maxAttempts = 4,
}) {
  // Re-read desired state after each confirmed response; clicks during a request may
  // change the next step. The attempt cap bounds convergence, not automatic retries
  // after failed or uncertain responses.
  let attempts = 0;
  while (isActive() && getDesired() !== getConfirmed()) {
    if (attempts >= maxAttempts) {
      onFailure({ error: "Could not synchronize favorite. Please try again." });
      return;
    }
    attempts += 1;
    let result;
    try {
      result = await toggle();
    } catch (error) {
      if (isActive()) onFailure(error);
      return;
    }

    if (!isActive()) return;

    // Do not guess server state from a success flag alone; require its actual boolean.
    // The caller restores its last confirmed state on failure.
    if (!result?.success || typeof result.isFavorited !== "boolean") {
      onFailure(result);
      return;
    }

    onConfirmed(result.isFavorited);
  }
}
