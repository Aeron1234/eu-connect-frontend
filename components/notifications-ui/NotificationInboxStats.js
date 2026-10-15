"use client";

import { Bell, BellRing } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationInboxStats({ totalRecords, unreadCount, selectedScope, inboxQuery }) {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2">
      <StatCard
        icon={<Bell className="size-5 opacity-80" />}
        value={String(totalRecords)}
        label={selectedScope === "requests" ? "Supervisor Requests" : "All Notifications"}
        highlight
        loading={inboxQuery.isPending}
      />
      <StatCard
        icon={<BellRing className="size-5 text-muted-foreground" />}
        value={String(unreadCount)}
        label="Unread"
        loading={inboxQuery.isPending}
      />
    </div>
  );
}

function StatCard({ icon, value, label, highlight, loading = false }) {
  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 rounded-xl border px-4 sm:px-5 py-4 sm:py-5 shadow-sm ${
        highlight
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground"
      }`}
    >
      {icon}
      <div>
        {loading ? <Skeleton className={`h-6 w-10 ${highlight ? "bg-white/30" : ""}`} /> : <p className="text-xl sm:text-2xl font-bold leading-none">{value}</p>}
        {loading ? <Skeleton className={`mt-1.5 h-3 w-24 ${highlight ? "bg-white/25" : ""}`} /> : <p className={`mt-1.5 text-xs ${highlight ? "opacity-80" : "text-muted-foreground"}`}>{label}</p>}
      </div>
    </div>
  );
}
