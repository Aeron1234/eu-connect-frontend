"use client";

import { Clock, CheckCircle2, XCircle } from "lucide-react";

const statusMeta = {
  pending: {
    label: "Pending Approval",
    cls: "bg-amber-50 text-amber-700",
    icon: Clock,
  },
  ongoing: { label: "Ongoing", cls: "bg-blue-50 text-blue-700", icon: Clock },
  finished: {
    label: "Finished",
    cls: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    cls: "bg-red-50 text-red-700",
    icon: XCircle,
  },
};

export default function RecordStatusPill({ status }) {
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
