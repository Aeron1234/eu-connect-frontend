"use client";

import { useState } from "react";
import { Calendar, Clock, Mail, Eye, Users } from "lucide-react";
import Link from "next/link";

const statusBadgeStyles = {
  ongoing: "text-blue-700 bg-blue-50",
  completed: "text-emerald-700 bg-emerald-50",
};

const filters = ["All", "Ongoing", "Completed"];

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function InternsSupervisedCard({ interns = [] }) {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredInterns =
    activeFilter === "All"
      ? interns
      : interns.filter(
          (i) => i.status.toLowerCase() === activeFilter.toLowerCase(),
        );

  return (
    <div className="h-full rounded-xl bg-white border border-stone-300 shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-800">
          <Users className="w-4 h-4 text-primary-500" />
          Interns You Supervised
        </h3>
        <div className="flex items-center gap-1.5">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeFilter === f
                  ? "bg-primary-500 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 overflow-x-auto">
        {filteredInterns.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No interns in this category.
          </p>
        ) : (
          filteredInterns.map((intern, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 rounded-lg border border-stone-200 p-4 w-xl md:w-full"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center text-xs font-semibold">
                  {intern.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-stone-800">
                      {intern.name}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusBadgeStyles[intern.status]}`}
                    >
                      {intern.status}
                    </span>
                  </div>
                  <p
                    className="text-xs text-muted-foreground mt-0.5"
                    title={intern.programShort || undefined}
                  >
                    {intern.role} · {intern.program}
                  </p>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-stone-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(intern.startDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {intern.hoursCompleted}/{intern.hoursRequired} hrs
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {intern.email}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={`/users/${intern.id}`}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                View profile
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default InternsSupervisedCard;
