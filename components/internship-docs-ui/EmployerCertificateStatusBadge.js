"use client";

import { Clock3, CheckCircle2 } from "lucide-react";

export default function EmployerCertificateStatusBadge({ status }) {
  if (status === "pending") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200"
      >
        <Clock3 className="w-3 h-3" /> Awaiting confirmation
      </span>
    );
  }
  if (status === "accepted") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
      >
        <CheckCircle2 className="w-3 h-3" /> Confirmed
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200"
      >
        Rejected
      </span>
    );
  }
  return null;
}
