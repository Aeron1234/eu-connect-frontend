import { mergeFeedbackDetail } from "../feedback.mjs";
import { getFeedbackFeed, getFeedbackDetail, getFeedbackInterns } from "../server-actions/feedback-actions";
// Scope private feed/detail caches by viewer and role; list filters form part
// of the key so paging/search cannot reuse a different audience's results.
export const feedbackKeys = {
  all: userId => ["feedback", String(userId)],
  list: (userId, filters, role) => ["feedback", String(userId), "list", role, filters],
  detail: (userId, id, role) => ["feedback", String(userId), "detail", role, id],
  interns: userId => ["feedback", String(userId), "interns"],
};
export async function readFeedback(action) {
  const result = await action();
  if (!result?.success) {
    const error = new Error(result?.error || "Could not load feedback.");
    error.status = result?.statusCode;
    throw error;
  }
  return result;
}
export function feedbackListOptions(userId, filters, role) {
  return { queryKey: feedbackKeys.list(userId, filters, role), queryFn: () => readFeedback(() => getFeedbackFeed(filters)), staleTime: 15000, retry: false };
}
export function feedbackDetailOptions(userId, id, role) {
  return { queryKey: feedbackKeys.detail(userId, id, role), queryFn: () => readFeedback(() => getFeedbackDetail(id)), staleTime: 10000, retry: false, structuralSharing: mergeFeedbackDetail };
}
export function feedbackInternOptions(userId) {
  return { queryKey: feedbackKeys.interns(userId), queryFn: () => readFeedback(getFeedbackInterns), staleTime: 30000, retry: false };
}

/** Seed only a successful, server-authorized creation; never expose another user's cache. */
export async function cacheCreatedFeedback(queryClient, { userId, role, id, detail }) {
  if (role !== "employer" || !userId || !id) throw new Error("Could not confirm the posted feedback.");
  const all = feedbackKeys.all(userId);
  // A pre-mutation read must not finish late and overwrite the new post.
  await queryClient.cancelQueries({ queryKey: all });
  let saved = detail;
  if (!saved?.post || saved.post.id !== id || saved.post.author_id !== userId) {
    // Compatibility with an older backend that returns only the created ID.
    saved = await readFeedback(() => getFeedbackDetail(id));
  }
  if (role !== "employer" || saved?.post?.id !== id || saved.post.author_id !== userId) {
    throw new Error("Could not confirm the posted feedback.");
  }
  const firstPage = { category: "all", status: "all", page: 1, search: "" };
  queryClient.setQueryData(feedbackKeys.detail(userId, id, role), saved);
  const post = {
    ...saved.post, mentions: saved.mentions || [],
    attachment_count: saved.attachments?.length || 0, reply_count: saved.replies?.length || 0,
  };
  queryClient.setQueryData(feedbackKeys.list(userId, firstPage, role), previous => {
    const existing = previous?.posts || [];
    const duplicate = existing.some(item => item.id === id);
    const posts = [post, ...existing.filter(item => item.id !== id)].slice(0, 15);
    const total = Math.max(posts.length, Number(previous?.total || 0) + (duplicate ? 0 : 1));
    return { ...previous, success: true, posts, page: 1, total, totalPages: Math.max(1, Math.ceil(total / 15)) };
  });
  // Other filters/pages must refetch next time they are opened; keep immediate
  // data visible while the board starts its explicit post-commit confirmation.
  await queryClient.invalidateQueries({ queryKey: all, refetchType: "none" });
}

// Cancel older reads before applying an authorized edited detail to this viewer's
// cached feeds. The thread then refreshes to reconcile filtering, order and counts.
export async function cacheEditedFeedback(queryClient, { userId, role, id, detail }) {
  await queryClient.cancelQueries({ queryKey: feedbackKeys.all(userId) });
  if (detail?.post?.id === id && detail.post.author_id === userId) {
    queryClient.setQueryData(feedbackKeys.detail(userId, id, role), detail);
    queryClient.setQueriesData({ queryKey: feedbackKeys.all(userId) }, previous => {
      if (!Array.isArray(previous?.posts)) return previous;
      return { ...previous, posts: previous.posts.map(post => post.id !== id ? post : {
        ...detail.post, mentions: detail.mentions, attachment_count: detail.attachments.length,
        reply_count: detail.replies.length,
      }) };
    });
  }
}
// After confirmed deletion, remove this viewer's feed rows and private detail.
// Invalidate remaining variants without refetching them before navigation completes.
export async function removeCachedFeedback(queryClient, userId, id) {
  const all = feedbackKeys.all(userId);
  await queryClient.cancelQueries({ queryKey: all });
  queryClient.setQueriesData({ queryKey: all }, previous => {
    if (!Array.isArray(previous?.posts)) return previous;
    const posts = previous.posts.filter(post => post.id !== id);
    return { ...previous, posts, total: Math.max(0, Number(previous.total || 0) - (posts.length < previous.posts.length ? 1 : 0)) };
  });
  queryClient.removeQueries({ queryKey: all, predicate: query => query.queryKey[2] === "detail" && query.queryKey.at(-1) === id });
  await queryClient.invalidateQueries({ queryKey: all, refetchType: "none" });
}
