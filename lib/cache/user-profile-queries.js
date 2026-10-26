"use client";

import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
  getSearchedStudentDTRsResult,
  getSearchedStudentDtrLocationResult,
} from "@/lib/server-actions/dtr-actions";
import {
  fetchMoreSearchedStudentWeeklyNarrativesResult,
  getSearchedStudentWeeklyNarrativesResult,
} from "@/lib/server-actions/weekly-narratives-actions";
import { hasValidPage } from "@/lib/see-more-pagination.mjs";
import {
  getStudentPastEvaluationsResult,
  getStudentEvaluationCriteriasResult,
} from "@/lib/server-actions/evaluations-actions";
import { getEmployerUploadedFilesResult } from "@/lib/server-actions/internship-docs-actions";

// Separate each viewer/target pair; these keys organize client data, not authorization.
export const userProfileKeys = {
  all: (viewerId, searchedUserId) => [
    "user-profile",
    String(viewerId),
    String(searchedUserId),
  ],
  dtrPages: (viewerId, searchedUserId) => [
    ...userProfileKeys.all(viewerId, searchedUserId),
    "dtr",
  ],
  narrativePages: (viewerId, searchedUserId) => [
    ...userProfileKeys.all(viewerId, searchedUserId),
    "narrative-pages",
  ],
  tab: (viewerId, searchedUserId, tab, dtrPage = 1) => [
    ...userProfileKeys.all(viewerId, searchedUserId),
    tab,
    ...(tab === "dtr" ? [dtrPage] : []),
  ],
};

function requireList(result, message) {
  if (!Array.isArray(result)) throw new Error(result?.error || message);
  return result;
}

export function userProfileNarrativesInfiniteOptions(viewerId, searchedUserId) {
  return infiniteQueryOptions({
    queryKey: userProfileKeys.narrativePages(viewerId, searchedUserId),
    queryFn: async ({ pageParam }) => {
      const result = pageParam === 1
        ? await getSearchedStudentWeeklyNarrativesResult(searchedUserId)
        : await fetchMoreSearchedStudentWeeklyNarrativesResult({
            page: pageParam,
            searchedUserId,
          });
      if (!hasValidPage(result, "narratives", null, pageParam)) {
        throw new Error(result?.error || "Could not load narratives.");
      }
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
    // Narrative pages stay fresh until invalidated; inactive queries are collected after
    // five minutes. Focus/reconnect do not refresh them automatically.
    staleTime: Infinity,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

function requirePage(result, collection, message) {
  if (!Array.isArray(result?.[collection]) || !Number.isInteger(result?.totalPages)) {
    throw new Error(result?.error || message);
  }
  return result;
}

export function userProfileTabOptions(
  viewerId,
  searchedUserId,
  tab,
  dtrPage,
  userRole,
) {
  return queryOptions({
    queryKey: userProfileKeys.tab(viewerId, searchedUserId, tab, dtrPage),
    queryFn: async () => {
      switch (tab) {
        case "dtr": {
          const [dtrData, dtrLocation] = await Promise.all([
            getSearchedStudentDTRsResult(searchedUserId, dtrPage),
            ["employer", "admin"].includes(userRole)
              ? getSearchedStudentDtrLocationResult(searchedUserId)
              : Promise.resolve(null),
          ]);
          if (dtrLocation?.error) throw new Error(dtrLocation.error);
          return {
            dtrData: requirePage(dtrData, "dtrs", "Could not load time records."),
            dtrLocation,
          };
        }
        case "narratives":
          return {
            narrativeData: requirePage(
              await getSearchedStudentWeeklyNarrativesResult(searchedUserId),
              "narratives",
              "Could not load narratives.",
            ),
          };
        case "evaluations": {
          const [pastEvaluationsData, studentEvaluationCriterias] = await Promise.all([
            getStudentPastEvaluationsResult(searchedUserId),
            userRole === "employer"
              ? getStudentEvaluationCriteriasResult()
              : Promise.resolve(null),
          ]);
          if (!Array.isArray(pastEvaluationsData?.data)) {
            throw new Error(pastEvaluationsData?.error || "Could not load evaluations.");
          }
          return {
            pastEvaluationsData,
            studentEvaluationCriterias: userRole === "employer"
              ? requireList(studentEvaluationCriterias, "Could not load evaluation criteria.")
              : null,
          };
        }
        case "certificates":
          return {
            uploadedFiles: requireList(
              await getEmployerUploadedFilesResult(searchedUserId),
              "Could not load certificates.",
            ),
          };
        default:
          return null;
      }
    },
    staleTime: tab === "dtr" ? 15_000 : 60_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
