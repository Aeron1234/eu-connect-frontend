"use client";

import { queryOptions } from "@tanstack/react-query";
import { getCoursesResult } from "@/lib/server-actions/course-and-department-actions";
import { getAnnouncementCategoriesResult } from "@/lib/server-actions/announcements-actions";
import { getFileRequirementTypesResult } from "@/lib/server-actions/internship-docs-actions";

// Share slow-changing course/category/requirement lists under viewer-specific keys.
// The list factory rejects failed reads; feature mutations invalidate dependent reference keys.
export const referenceKeys = {
  courses: (userId) => ["reference", String(userId), "courses"],
  announcementCategories: (userId) => ["reference", String(userId), "announcement-categories"],
  fileRequirementTypes: (userId) => ["reference", String(userId), "file-requirement-types"],
};

function listOptions(queryKey, read, message) {
  return queryOptions({
    queryKey,
    queryFn: async () => {
      const result = await read();
      if (!Array.isArray(result)) throw new Error(result?.error || message);
      return result;
    },
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export const coursesOptions = (userId) =>
  listOptions(referenceKeys.courses(userId), getCoursesResult, "Could not load courses.");
export const announcementCategoriesOptions = (userId) =>
  listOptions(referenceKeys.announcementCategories(userId), getAnnouncementCategoriesResult, "Could not load announcement categories.");
export const fileRequirementTypesOptions = (userId) =>
  listOptions(referenceKeys.fileRequirementTypes(userId), getFileRequirementTypesResult, "Could not load document requirements.");
