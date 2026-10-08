"use client";

import {
  Building2,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { internshipRecordsKeys } from "@/lib/cache/internship-records-queries";
import { mapLocationsKeys } from "@/lib/cache/map-locations-queries";
import { dashboardOverviewKeys } from "@/lib/cache/dashboard-overview-queries";
import { toastAndAction } from "../../lib/helpers";
import {
  restoreInternshipRecord,
  updateInternshipRecordStatus,
} from "@/lib/server-actions/internship-records-actions";

const statusMeta = {
  pending: {
    label: "Pending Approval",
    cls: "bg-amber-100 text-amber-800",
    icon: Clock,
  },
  ongoing: { label: "Ongoing", cls: "bg-blue-100 text-blue-800", icon: Clock },
  finished: {
    label: "Finished",
    cls: "bg-emerald-100 text-emerald-800",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    cls: "bg-rose-100 text-rose-800",
    icon: XCircle,
  },
};

function StatusPill({ status }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.cls}`}
    >
      <Icon className="h-3.5 w-3.5" /> {meta.label}
    </span>
  );
}

function RecordsHeader({ record, internshipId }) {
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const { user } = useUser();

  function handleStatus(status) {
    const formData = new FormData();
    formData.append("id", internshipId);
    formData.append("status", status);

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Updating record...",
        successLabel: "Record updated.",
        errorLabel: "Failed to update record.",
        action:
          status === "restore"
            ? restoreInternshipRecord
            : updateInternshipRecordStatus,
        formData,
      });
      if (result?.success) {
        await queryClient.invalidateQueries({
          queryKey: internshipRecordsKeys.all(user.id),
          refetchType: "none",
        });
        void queryClient.invalidateQueries({ queryKey: mapLocationsKeys.all(user.id) });
        void queryClient.invalidateQueries({ queryKey: dashboardOverviewKeys.role(user.id, user.role) });
      }
    });
  }

  return (
    <div className="brand-orbit rounded-xl bg-primary p-6 text-primary-foreground">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">
            {record.student_name}
          </h1>
          <p className="mt-1 text-sm text-primary-foreground/80">
            {record.student_number ? `${record.student_number} ·` : ""}{" "}
            {record.course_name}
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary-foreground/90">
            <Building2 className="h-4 w-4" /> {record.internship_position} at{" "}
            {record.company_name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={record.status} />
          {record.status === "pending" && (
            <>
              <button
                type="button"
                onClick={() => handleStatus("ongoing")}
                disabled={isPending}
                className="rounded-lg bg-card px-4 py-2 text-sm font-semibold text-primary-emphasis"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleStatus("rejected")}
                disabled={isPending}
                className="rounded-lg border border-primary-foreground/40 px-4 py-2 text-sm font-semibold"
              >
                Reject
              </button>
            </>
          )}
          {record.status === "rejected" && (
            <button
              type="button"
              onClick={() => handleStatus("restore")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-card px-4 py-2 text-sm font-semibold text-primary-emphasis"
            >
              <RotateCcw className="h-4 w-4" /> Restore
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecordsHeader;
