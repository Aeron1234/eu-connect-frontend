export function formatGender(gender) {
  const value = typeof gender === "string" ? gender.trim() : "";
  return value ? value[0].toUpperCase() + value.slice(1).toLowerCase() : "—";
}
