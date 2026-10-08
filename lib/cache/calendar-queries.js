"use client";

import { queryOptions } from "@tanstack/react-query";
import { getCalendarMonth } from "@/lib/server-actions/calendar-actions";

export function isCalendarMonth(value) {
  return (
    Array.isArray(value?.announcements) &&
    Array.isArray(value?.schedules) &&
    Array.isArray(value?.todos) &&
    (value.internship === null || (value.internship && typeof value.internship === "object"))
  );
}

export const calendarKeys = {
  all: (userId) => ["calendar", String(userId)],
  month: (userId, role, departmentId, month) => [
    ...calendarKeys.all(userId),
    role,
    String(departmentId ?? ""),
    month,
  ],
};

export function calendarMonthOptions(userId, role, departmentId, month) {
  return queryOptions({
    queryKey: calendarKeys.month(userId, role, departmentId, month),
    queryFn: async () => {
      const result = await getCalendarMonth(month);
      if (!isCalendarMonth(result)) {
        throw new Error(result?.error || "Invalid calendar response");
      }
      return result;
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
