"use client";

import { Building2, Users, FileText } from "lucide-react";
import { cx } from "@/lib/utils";

export default function AnnexDStats({ total, totalInterns, year }) {
  return (
    <div className="mt-6 grid gap-3 sm:gap-4 md:grid-cols-3">
      <StatCard
        icon={<Building2 className="size-5 opacity-80" />}
        value={String(total)}
        label="Partner HTEs"
        highlight
      />
      <StatCard
        icon={<Users className="size-5 text-foreground-subtle" />}
        value={String(totalInterns)}
        label="Total Interns (loaded)"
      />
      <StatCard
        icon={<FileText className="size-5 text-foreground-subtle" />}
        value={year || "All"}
        label="Academic Year"
      />
    </div>
  );
}

function StatCard({ icon, value, label, highlight }) {
  return (
    <div
      className={cx(
        "flex items-center gap-3 sm:gap-4 rounded-xl border px-4 sm:px-5 py-4 sm:py-5 shadow-sm",
        highlight
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground",
      )}
    >
      {icon}
      <div>
        <p className="text-xl sm:text-2xl font-bold leading-none">{value}</p>
        <p
          className={cx(
            "mt-1.5 text-xs",
            highlight ? "opacity-80" : "text-muted-foreground",
          )}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
