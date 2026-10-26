"use client";

import { infiniteQueryOptions } from "@tanstack/react-query";
import { getInternshipPostsResult } from "@/lib/server-actions/internship-posts-actions";
import { hasValidPage } from "@/lib/see-more-pagination.mjs";

// Partition page stacks by viewer and every list filter, including favorite state.
export const internshipPostsKeys = {
  all: (userId) => ["internship-posts", String(userId)],
  list: (userId, filters) => [
    ...internshipPostsKeys.all(userId),
    filters.workType,
    filters.courseId,
    filters.search,
    filters.mine,
    filters.favorite,
  ],
};

// Select only this viewer's favorited/not_favorited variants for membership refresh.
// The favorite filter occupies index 6 in the key layout defined above.
export function isFavoriteInternshipPostsQuery(userId, query) {
  const key = query.queryKey;
  return (
    key[0] === "internship-posts" &&
    key[1] === String(userId) &&
    Boolean(key[6])
  );
}

export function internshipPostsInfiniteOptions(userId, filters) {
  return infiniteQueryOptions({
    queryKey: internshipPostsKeys.list(userId, filters),
    queryFn: async ({ pageParam }) => {
      const result = await getInternshipPostsResult({ ...filters, page: pageParam });
      if (!hasValidPage(result, "data", "pagination", pageParam)) {
        throw new Error(result?.error || "Invalid internship posts response");
      }
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
