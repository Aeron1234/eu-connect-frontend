"use client";

import { format } from "date-fns";
import {
  Calendar,
  CircleCheck,
  Clock,
  Globe,
  LoaderCircle,
  MapPin,
  Trash2,
  XCircle,
} from "lucide-react";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    tone: "bg-amber-50 text-amber-700",
  },
  ongoing: {
    label: "Ongoing",
    icon: LoaderCircle,
    tone: "bg-blue-50 text-blue-700",
  },
  finished: {
    label: "Finished",
    icon: CircleCheck,
    tone: "bg-emerald-50 text-emerald-700",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    tone: "bg-stone-100 text-stone-600",
  },
};

function StatusPill({ status }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${config.tone}`}
    >
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}

function StudentInternshipRecordList({ userInternshipData = [] }) {
  if (userInternshipData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 bg-white px-6 py-16 sm:py-20 text-center">
        <Calendar className="size-8 text-stone-300" />
        <p className="text-sm font-medium text-stone-500">
          No internship records yet
        </p>
        <p className="max-w-sm text-xs text-stone-400">
          Submit one from the Form tab to get started.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3 sm:gap-4">
      {userInternshipData.map((record) => (
        <li key={record.id}>
          <Record record={record} />
        </li>
      ))}
    </ul>
  );
}

function Record({ record }) {
  const {
    company_name,
    company_address,
    status,
    internship_position,
    description,
    company_website,
    date_started,
    date_ended,
    total_hours,
  } = record;

  return (
    <div className="rounded-xl border border-stone-300 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-stone-800 text-sm sm:text-base">
              {company_name}
            </h3>
            <StatusPill status={status} />
          </div>
          <p className="mt-0.5 text-sm text-stone-500 line-clamp-2">
            {internship_position}
          </p>
        </div>

        {/* Non-functional as-is (no onClick wired) — matching the original,
            not adding delete behavior here since that wasn't part of this
            request. */}
        <button
          type="button"
          title="Delete record"
          className="flex-shrink-0 rounded-md p-2 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-xs text-stone-500 sm:grid-cols-2">
        <span className="flex items-center gap-1.5">
          <Calendar className="size-3.5 flex-shrink-0" />
          {format(new Date(date_started), "MMM d, yyyy")}
          {date_ended && <> – {format(new Date(date_ended), "MMM d, yyyy")}</>}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5 flex-shrink-0" />
          {total_hours} hrs required
        </span>
        <span className="flex items-start gap-1.5 sm:col-span-2">
          <MapPin className="size-3.5 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{company_address}</span>
        </span>
        {company_website && (
          <span className="flex items-center gap-1.5 sm:col-span-2 min-w-0">
            <Globe className="size-3.5 flex-shrink-0" />
            <a
              href={`https://${company_website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-500 underline truncate"
            >
              {company_website}
            </a>
          </span>
        )}
      </div>

      <p className="mt-3 border-t border-stone-200 pt-3 text-xs leading-relaxed text-stone-500 line-clamp-2">
        {description}
      </p>
    </div>
  );
}

export default StudentInternshipRecordList;
