import { format } from "date-fns";
import RecordsDtrTable from "./RecordsDtrTable";
import {
  getInternshipRecordDocuments,
  getInternshipRecordDtr,
  getInternshipRecordEvaluations,
  getInternshipRecordWeeklyNarratives,
} from "../_services/dept-head-actions";
import RecordsNarrative from "./RecordsNarratives";
import EvaluationCard from "./EvaluationCard";
import {
  getFileRequirementTypes,
  getSearchedStudentDtrLocation,
} from "../_services/services";
import RecordsDocuments from "./RecordsDocuments";
import SetDtrLocation from "./SetDtrLocation";

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
          <div className="rounded-xl border border-stone-300 shadow-sm bg-white p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-bold text-primary-500">
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
                  <dd className="text-right font-medium text-stone-800">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-xl border border-stone-300 shadow-sm bg-white p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-bold text-primary-500">
              Hours Rendered
            </h3>
            <p className="mt-3 text-2xl sm:text-3xl font-bold text-primary-500">
              {record.accumulated_hours.toFixed(1)}
              <span className="text-sm sm:text-base font-normal text-muted-foreground">
                /{record.total_hours} hrs
              </span>
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-primary-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {pct}% of required hours completed
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3 text-center text-xs">
              <Stat label="DTR entries" value={record.dtr_count} />
              <Stat label="Narratives" value={record.narrative_count} />
              <Stat label="Documents" value={record.document_count} />
            </div>
          </div>
        </div>
      )}

      {filter === "dtr" && (
        <DtrTab internshipId={internshipId} studentId={record?.student_id} />
      )}

      {filter === "narratives" && <NarrativesTab internshipId={internshipId} />}

      {filter === "evaluations" && (
        <EvaluationsTab internshipId={internshipId} />
      )}

      {filter === "documents" && <DocumentsTab internshipId={internshipId} />}
    </>
  );
}

async function DtrTab({ internshipId, studentId }) {
  const dtrs = await getInternshipRecordDtr(internshipId);

  return (
    <>
      <div className="rounded-xl bg-white border border-stone-300 shadow-sm p-4 sm:p-6">
        <RecordsDtrTable dtrs={dtrs || []} />
      </div>

      <SetLocationForm studentId={studentId} />
    </>
  );
}

async function SetLocationForm({ studentId }) {
  const data = (await getSearchedStudentDtrLocation(studentId)) || {};

  const dataLocation = {
    internship_id: data?.internship_id,
    is_custom_location: data?.is_custom_location || false,
    location: {
      lat: data?.location?.lat,
      lon: data?.location?.lon,
      radius_meters: data?.location?.radius_meters,
      label: data?.location?.label,
      address: data?.location?.address || null,
      set_by: data?.location?.set_by || null,
      created_at: data?.location?.created_at || null,
      updated_at: data?.location?.updated_at || null,
    },
  };

  return <SetDtrLocation studentId={studentId} dataLocation={dataLocation} />;
}

async function NarrativesTab({ internshipId }) {
  const narratives = await getInternshipRecordWeeklyNarratives(internshipId);

  console.log(narratives);

  return (
    <ul className="space-y-3 sm:space-y-4">
      {(Array.isArray(narratives) ? narratives : []).map((narrative) => (
        <RecordsNarrative
          key={`${narrative.id}-${narrative.updated_at || narrative.created_at}`}
          narrative={narrative}
        />
      ))}

      {(!Array.isArray(narratives) || narratives.length === 0) && (
        <li className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 bg-white px-6 py-16 sm:py-20 text-center">
          <p className="text-sm text-stone-500">No narratives yet.</p>
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
    <div className="rounded-lg bg-stone-100 py-2">
      <p className="text-base sm:text-lg font-bold text-primary-500">{value}</p>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}

export default RecordsDetailsPageContent;
