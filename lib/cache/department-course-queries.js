"use client";

import { queryOptions } from "@tanstack/react-query";
import {
  getCoursesResult,
  getDepartmentsResult,
} from "@/lib/server-actions/course-and-department-actions";

export const departmentCourseKeys = {
  all: (userId) => ["department-course-admin", String(userId)],
  departments: (userId) => [...departmentCourseKeys.all(userId), "departments"],
  courses: (userId) => [...departmentCourseKeys.all(userId), "courses"],
};

function listOptions(queryKey, read, message) {
  return queryOptions({
    queryKey,
    queryFn: async () => {
      const result = await read({ includeInactive: true });
      if (!Array.isArray(result)) {
        throw new Error(result?.error || message);
      }
      return result;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function adminDepartmentsOptions(userId) {
  return listOptions(
    departmentCourseKeys.departments(userId),
    getDepartmentsResult,
    "Could not load departments.",
  );
}

export function adminCoursesOptions(userId) {
  return listOptions(
    departmentCourseKeys.courses(userId),
    getCoursesResult,
    "Could not load courses.",
  );
}
