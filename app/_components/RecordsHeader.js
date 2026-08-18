import {
  Building2,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
} from "lucide-react";

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

function RecordsHeader({ record }) {
  return (
    <div className="rounded-xl bg-primary-500 p-6 text-primary-foreground">
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
                // onClick={() => onStatus(record.id, "ongoing")}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary-500"
              >
                Approve
              </button>
              <button
                type="button"
                // onClick={() => onStatus(record.id, "rejected")}
                className="rounded-lg border border-primary-foreground/40 px-4 py-2 text-sm font-semibold"
              >
                Reject
              </button>
            </>
          )}
          {record.status === "rejected" && (
            <button
              type="button"
              // onClick={() => onStatus(record.id, "pending")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary-500"
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
