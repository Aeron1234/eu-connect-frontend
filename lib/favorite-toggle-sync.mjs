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

    if (!result?.success || typeof result.isFavorited !== "boolean") {
      onFailure(result);
      return;
    }

    onConfirmed(result.isFavorited);
  }
}
