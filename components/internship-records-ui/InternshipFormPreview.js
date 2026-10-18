import { BriefcaseBusiness, ClipboardCheck } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";

function previewDate(value) {
  if (!value) return "Not set yet";
  const date = parseISO(value);
  return isValid(date) ? format(date, "MMM d, yyyy") : "Not set yet";
}

export default function InternshipFormPreview({ internshipForm, region, recordStatus = "" }) {
  return (
    <aside className="min-w-0 border-t border-border bg-muted/20 p-5 sm:p-6 xl:border-l xl:border-t-0" aria-label={recordStatus ? "Internship details" : "Placement preview"}>
      <div className="xl:sticky xl:top-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{recordStatus ? "Internship details" : "Placement preview"}</p>
        {recordStatus && <span className="mt-3 inline-flex rounded-full bg-primary/8 px-2.5 py-1 text-[11px] font-semibold text-primary-emphasis">{recordStatus === "ongoing" ? "Ongoing" : "Pending"}</span>}
        <div className="mt-5 flex items-center gap-3 xl:block">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/8 text-primary-emphasis xl:size-14"><BriefcaseBusiness className="size-5" aria-hidden="true" /></div>
          <div className="min-w-0 xl:mt-4">
            <p className="break-words text-sm font-semibold leading-6 text-foreground">{internshipForm.company_name.trim() || "Your company"}</p>
            <p className="mt-1 break-words text-xs leading-relaxed text-muted-foreground">{internshipForm.internship_position.trim() || "Your internship position"}</p>
          </div>
        </div>
        <dl className="mt-6 space-y-4 border-t border-border pt-5 text-xs">
          <div><dt className="text-muted-foreground">Region</dt><dd className="mt-1 break-words font-medium text-foreground">{region?.region_name || "Not selected yet"}</dd></div>
          <div><dt className="text-muted-foreground">Start date</dt><dd className="mt-1 font-medium text-foreground">{previewDate(internshipForm.date_started)}</dd></div>
          <div><dt className="text-muted-foreground">Estimated end date</dt><dd className="mt-1 font-medium text-foreground">{previewDate(internshipForm.date_ended)}</dd></div>
          <div className="grid grid-cols-2 gap-3">
            <div><dt className="text-muted-foreground">Semester</dt><dd className="mt-1 font-medium text-foreground">{{ "1st": "First", "2nd": "Second", summer: "Summer" }[internshipForm.semester] || "Not selected"}</dd></div>
            <div><dt className="text-muted-foreground">Required hours</dt><dd className="mt-1 break-words font-medium text-foreground">{internshipForm.total_hours !== "" ? `${internshipForm.total_hours} hrs` : "Not set yet"}</dd></div>
          </div>
          <div><dt className="text-muted-foreground">Company address</dt><dd className="mt-1 break-words font-medium leading-relaxed text-foreground">{internshipForm.company_address.trim() || "Choose a location on the map"}</dd></div>
        </dl>
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-border bg-card p-3.5">
          <ClipboardCheck className="mt-0.5 size-4 shrink-0 text-primary-emphasis" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-muted-foreground">{recordStatus === "pending" ? "Changes appear here as you edit. Select Save changes to update your pending record before it is reviewed." : recordStatus === "ongoing" ? "Your internship is ongoing. You can create another record once this internship is finished." : "Review your details before submitting. Your department head will review and approve your internship record."}</p>
        </div>
      </div>
    </aside>
  );
}
