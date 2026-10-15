"use client";

import { Pencil, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { secondaryButton } from "./summaryReportFields";
import SummaryReportPrintButton from "./SummaryReportPrintButton";

export default function SummaryReportsToolbar({ record, records, editing, setSelectedId, setEditing, setConfirmingDelete }) {
  return (
    <section
      className="flex flex-col gap-5 rounded-xl border border-border bg-card p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between xl:gap-8"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:gap-7">
        <span id="summary-internship-label" className="shrink-0 text-sm font-semibold text-foreground">Internship record</span>
        <Select value={record.internship_id} onValueChange={(value) => { setSelectedId(value); setEditing(false);
}}>
          <SelectTrigger
            aria-labelledby="summary-internship-label"
            className="min-h-10 w-full min-w-0 bg-canvas px-3 sm:max-w-xl"
          >
            <SelectValue placeholder="Choose an internship" />
          </SelectTrigger>
          <SelectContent>
            {records.map((item) => <SelectItem key={item.internship_id} value={item.internship_id}>{item.company_name} - {item.status}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {record.report_id && !editing && (
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button type="button" onClick={() => setEditing(true)} className={`${secondaryButton} flex-1 sm:flex-none`}><Pencil className="size-4" aria-hidden="true" />Edit</button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className={`${secondaryButton} flex-1 text-red-600 hover:text-red-700 sm:flex-none dark:text-red-300`}
          ><Trash2 className="size-4" aria-hidden="true" />Delete</button>
          <SummaryReportPrintButton internshipId={record.internship_id} className="w-full sm:w-auto" />
        </div>
      )}
    </section>
  );
}
