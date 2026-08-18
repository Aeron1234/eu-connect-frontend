import { format } from "date-fns";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Clock,
  FileText,
  FolderOpen,
  RotateCcw,
  Star,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import RecordsDtrTable from "./RecordsDtrTable";
import {
  getInternshipRecordDocuments,
  getInternshipRecordDtr,
  getInternshipRecordEvaluations,
  getInternshipRecordNarratives,
} from "../_services/dept-head-actions";
import RecordsNarrative from "./RecordsNarratives";
import EvaluationCard from "./EvaluationCard";
import { getFileRequirementTypes } from "../_services/services";
import RecordsDocuments from "./RecordsDocuments";

function RecordsDetailsPageContent({
  record,
  filter = "overview",
  internshipId,
}) {
  const pct = Math.min(
    100,
    Math.round((record.accumulated_hours / record.total_hours) * 100),
  );

  return (
    <>
      {filter === "overview" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-stone-200 shadow-sm bg-background p-5">
            <h3 className="font-display text-lg font-bold text-primary-500">
              Internship Details
            </h3>
            <dl className="mt-3 space-y-2 text-sm">
              {[
                ["Company", record.company_name],
                [
                  "Supervisor",
                  `${record.supervisor_name ? record.supervisor_name : "–"}`,
                ],
                [
                  "Duration",
                  record.status === "ongoing"
                    ? `${format(new Date(record.date_started), "MMMM-dd-yyyy")} – ${record.status === "ongoing" ? "still ongoing" : ` ${format(new Date(record.date_ended), "MMMM-dd-yyyy")}`}`
                    : "–",
                ],
                [
                  "Submitted",
                  `${format(new Date(record.created_at), "MMMM-dd-yyyy")}`,
                ],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-xl border border-stone-200 shadow-sm bg-background p-5">
            <h3 className="font-display text-lg font-bold text-primary-500">
              Hours Rendered
            </h3>
            <p className="mt-3 font-display text-3xl font-bold text-primary-500">
              {record.accumulated_hours.toFixed(1)}
              <span className="text-base text-muted-foreground">
                /{record.total_hours} hrs
              </span>
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-accent">
              <div
                className="h-full rounded-full bg-primary-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {pct}% of required hours completed
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
              <Stat label="DTR entries" value={record.dtr_count} />
              <Stat label="Narratives" value={record.narrative_count} />
              <Stat label="Documents" value={record.document_count} />
            </div>
          </div>
        </div>
      )}

      {filter === "dtr" && <DtrTab internshipId={internshipId} />}

      {filter === "narratives" && <NarrativesTab internshipId={internshipId} />}

      {filter === "evaluations" && (
        <EvaluationsTab internshipId={internshipId} />
      )}

      {filter === "documents" && <DocumentsTab internshipId={internshipId} />}
    </>
  );
}

async function DtrTab({ internshipId }) {
  const dtrs = await getInternshipRecordDtr(internshipId);

  return (
    <div className="rounded-xl bg-white border border-stone-200 p-5 sm:p-6">
      <RecordsDtrTable dtrs={dtrs || []} />
    </div>
  );
}

async function NarrativesTab({ internshipId }) {
  const narratives = await getInternshipRecordNarratives(internshipId);

  return (
    <ul className="space-y-4">
      {narratives.map((narrative) => (
        <RecordsNarrative
          key={`${narrative.id}-${narrative.updated_at || narrative.created_at}`}
          narrative={narrative}
        />
      ))}

      {narratives.length === 0 && (
        <li className="pl-12 md:pl-16 py-10 text-center text-sm text-stone-600">
          No narratives yet.
        </li>
      )}
    </ul>
  );
}

async function EvaluationsTab({ internshipId }) {
  const evaluations = await getInternshipRecordEvaluations(internshipId);

  return <EvaluationCard evaluations={evaluations || []} />;
}

async function DocumentsTab({ internshipId }) {
  const [fileData, requirementTypes] = await Promise.all([
    getInternshipRecordDocuments(internshipId),
    getFileRequirementTypes(),
  ]);

  return (
    <RecordsDocuments
      fileData={fileData || []}
      requirementTypes={requirementTypes || []}
      internshipId={internshipId}
    />
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-accent/60 py-2">
      <p className="font-display text-lg font-bold text-primary-500">{value}</p>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}

export default RecordsDetailsPageContent;
