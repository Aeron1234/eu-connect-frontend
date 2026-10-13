"use client";

import { queryOptions } from "@tanstack/react-query";
import { internshipRecordsKeys } from "./internship-records-queries";
import {
  getInternshipRecordDtrResult,
  getSearchedStudentDtrLocationResult,
} from "@/lib/server-actions/dtr-actions";
import { getInternshipRecordWeeklyNarrativesResult } from "@/lib/server-actions/weekly-narratives-actions";
import { getInternshipRecordEvaluationsResult } from "@/lib/server-actions/evaluations-actions";
import { getInternshipRecordSummaryReportResult } from "@/lib/server-actions/summary-reports-actions";
import {
  getInternshipRecordDocumentsResult,
  getFileRequirementTypesResult,
} from "@/lib/server-actions/internship-docs-actions";

export const internshipRecordDetailsKeys = {
  tab: (userId, internshipId, tab, dtrPage = 1) => [
    ...internshipRecordsKeys.all(userId),
    "detail",
    String(internshipId),
    tab,
    ...(tab === "dtr" ? [dtrPage] : []),
  ],
  dtrPages: (userId, internshipId) => [
    ...internshipRecordsKeys.all(userId),
    "detail",
    String(internshipId),
    "dtr",
  ],
};

function requireList(result, message) {
  if (!Array.isArray(result)) {
    throw new Error(result?.error || message);
  }
  return result;
}

function requireLocation(result) {
  if (result?.error) throw new Error(result.error);
  return result;
}

function requireDtrPage(result) {
  if (!Array.isArray(result?.dtrs) || !Number.isInteger(result?.totalPages)) {
    throw new Error(result?.error || "Could not load DTR entries.");
  }
  return result;
}

export function internshipRecordDetailsTabOptions(
  userId,
  internshipId,
  tab,
  record,
  dtrPage = 1,
) {
  return queryOptions({
    queryKey: internshipRecordDetailsKeys.tab(userId, internshipId, tab, dtrPage),
    queryFn: async () => {
      switch (tab) {
        case "dtr": {
          const [dtrData, dtrLocation] = await Promise.all([
            getInternshipRecordDtrResult(internshipId, dtrPage),
            record?.status === "ongoing"
              ? getSearchedStudentDtrLocationResult(record.student_id)
              : Promise.resolve(null),
          ]);
          return {
            dtrData: requireDtrPage(dtrData),
            dtrLocation: requireLocation(dtrLocation),
          };
        }
        case "narratives":
          return {
            narratives: requireList(
              await getInternshipRecordWeeklyNarrativesResult(internshipId),
              "Could not load narratives.",
            ),
          };
        case "evaluations":
          return {
            evaluations: requireList(
              await getInternshipRecordEvaluationsResult(internshipId),
              "Could not load evaluations.",
            ),
          };
        case "summary-report": {
          const result = await getInternshipRecordSummaryReportResult(internshipId);
          if (result?.error || !("report" in (result || {}))) {
            throw new Error(result?.error || "Could not load the summary report.");
          }
          return result;
        }
        case "documents": {
          const [fileData, requirementTypes] = await Promise.all([
            getInternshipRecordDocumentsResult(internshipId),
            getFileRequirementTypesResult(),
          ]);
          return {
            fileData: requireList(fileData, "Could not load documents."),
            requirementTypes: requireList(
              requirementTypes,
              "Could not load requirements.",
            ),
          };
        }
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
