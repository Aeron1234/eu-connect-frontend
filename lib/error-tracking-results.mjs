/** Reconcile a confirmed deletion using counts from this particular filtered view. */
export function removeErrorGroupFromResult(result, fingerprint) {
  if (!Array.isArray(result?.data) || !result.pagination || !result.stats) return result;
  // Adjust only views that contain this group, subtracting that view's filtered
  // occurrences rather than the server's all-history deletedOccurrences count.
  const group = result.data.find(item => item.fingerprint === fingerprint);
  if (!group) return result;
  const total = Math.max(0, Number(result.pagination.total) - 1);
  return {
    ...result,
    data: result.data.filter(item => item.fingerprint !== fingerprint),
    stats: {
      ...result.stats,
      totalGroups: Math.max(0, Number(result.stats.totalGroups) - 1),
      totalOccurrences: Math.max(0, Number(result.stats.totalOccurrences) - Number(group.occurrences)),
    },
    pagination: {
      ...result.pagination,
      total,
      totalPages: Math.ceil(total / result.pagination.limit),
    },
  };
}
