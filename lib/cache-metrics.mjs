export const CACHE_EVENTS = [
  "hit", "miss", "store", "read_error", "write_error",
  "bypass_method", "bypass_identity", "bypass_disabled",
  "skip_status", "skip_opt_out", "skip_cookie", "skip_generation",
  "skip_oversized", "skip_serialization", "invalidation_calls",
  "invalidated_entries", "expired_entries", "flushes",
];

function counters(current = {}, previous = {}) {
  const result = Object.fromEntries(CACHE_EVENTS.map((event) => [
    event,
    Math.max(0, Number(current[event] || 0) - Number(previous[event] || 0)),
  ]));
  result.lookups = result.hit + result.miss;
  result.hitRate = result.lookups ? result.hit / result.lookups : null;
  return result;
}

// Derive interval counters only when both snapshots belong to the same process start.
// After restart, use cumulative counters instead; clamp counter differences at zero.
export function deriveCacheView(snapshot, previous) {
  if (!snapshot) return null;
  const sameProcess = Boolean(previous && previous.startedAt === snapshot.startedAt);
  const previousRoutes = new Map(
    (sameProcess ? previous.routes || [] : []).map((row) => [row.route, row]),
  );
  return {
    interval: sameProcess,
    processChanged: Boolean(previous && !sameProcess),
    totals: counters(snapshot.totals, sameProcess ? previous.totals : {}),
    routes: (snapshot.routes || []).map((row) => ({
      route: row.route,
      ...counters(row, previousRoutes.get(row.route)),
    })),
  };
}
