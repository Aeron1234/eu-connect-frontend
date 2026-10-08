"use client";

import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
  getAnnexCReportsResult,
  getHteCompanyListResult,
  getAvailableAcademicYearsResult,
} from "@/lib/server-actions/sipp-hte-actions";
import { hasValidPage } from "@/lib/see-more-pagination.mjs";

export const sippReportsKeys = {
  academicYears: (userId) => ["sipp-reports", String(userId), "academic-years"],
  annexCAll: (userId) => ["sipp-reports", String(userId), "annex-c"],
  annexCList: (userId, filters) => [
    ...sippReportsKeys.annexCAll(userId),
    filters.academicYear,
    filters.status,
    filters.search,
  ],
  annexDAll: (userId) => ["sipp-reports", String(userId), "annex-d"],
  annexDList: (userId, filters) => [
    ...sippReportsKeys.annexDAll(userId),
    filters.academicYear,
    filters.search,
  ],
};

export function sippAcademicYearsOptions(userId) {
  return queryOptions({
    queryKey: sippReportsKeys.academicYears(userId),
    queryFn: async () => {
      const result = await getAvailableAcademicYearsResult();
      if (!Array.isArray(result)) throw new Error(result?.error || "Could not load academic years.");
      return result;
    },
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

function nextPage(lastPage) {
  const { page, totalPages } = lastPage.pagination;
  return page < totalPages ? page + 1 : undefined;
}

export function annexCReportsInfiniteOptions(userId, filters) {
  return infiniteQueryOptions({
    queryKey: sippReportsKeys.annexCList(userId, filters),
    queryFn: async ({ pageParam }) => {
      const result = await getAnnexCReportsResult({ ...filters, page: pageParam });
      if (!hasValidPage(result, "reports", "pagination", pageParam)) {
        throw new Error(result?.error || "Invalid Annex C reports response");
      }
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: nextPage,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function annexDHteInfiniteOptions(userId, filters) {
  return infiniteQueryOptions({
    queryKey: sippReportsKeys.annexDList(userId, filters),
    queryFn: async ({ pageParam }) => {
      const result = await getHteCompanyListResult({ ...filters, page: pageParam });
      if (!hasValidPage(result, "companies", "pagination", pageParam)) {
        throw new Error(result?.error || "Invalid Annex D HTE response");
      }
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: nextPage,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
