"use client";

import { formatGender } from "@/lib/formatGender";
import { formatAnnexDDuration } from "@/lib/annex-d-dates.mjs";

export default function AnnexDInternTable({ company: c }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[0.7rem] uppercase tracking-wider text-muted-foreground">
            <th className="w-12 px-4 sm:px-5 py-3 font-medium">#</th>
            <th className="px-4 sm:px-5 py-3 font-medium">
              Name of Student Intern
            </th>
            <th className="px-4 sm:px-5 py-3 font-medium">Program</th>
            <th className="px-4 sm:px-5 py-3 font-medium">Gender</th>
            <th className="px-4 sm:px-5 py-3 font-medium">
              Duration of Internship
            </th>
          </tr>
        </thead>
        <tbody>
          {c.interns.map((intern, i) => (
            <tr
              key={`${c.company_key}-${i}`}
              className="border-b border-border last:border-0"
            >
              <td className="px-4 sm:px-5 py-3 text-muted-foreground">
                {i + 1}
              </td>
              <td className="px-4 sm:px-5 py-3 font-medium text-foreground">
                {intern.name}
              </td>
              <td className="px-4 sm:px-5 py-3 text-foreground-soft">
                {intern.course}
              </td>
              <td className="px-4 sm:px-5 py-3 text-foreground-soft">
                {formatGender(intern.gender)}
              </td>
              <td className="px-4 sm:px-5 py-3 text-foreground-soft">
                {formatAnnexDDuration(intern.date_started, intern.date_ended)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
