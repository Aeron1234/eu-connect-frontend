// Display trimmed gender text with initial capitalization; blank/non-string values use a dash.
export function formatGender(gender) {
  const value = typeof gender === "string" ? gender.trim() : "";
  return value ? value[0].toUpperCase() + value.slice(1).toLowerCase() : "—";
}
