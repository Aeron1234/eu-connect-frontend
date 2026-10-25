import { CheckCircle2, Circle, FileCheck, FileText } from "lucide-react";
const CATEGORIES = [
  { key: "before", icon: <FileCheck className="w-3.5 h-3.5" /> },
  { key: "after", icon: <FileText className="w-3.5 h-3.5" /> },
];

function InternshipRequirementsType({ requirementTypes, docs }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
      {CATEGORIES.map(({ key }) => (
        <div key={key}>
          <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground mb-3">
            {key === "before" ? "Before Deployment" : "After Deployment"}
          </p>
          <ul className="space-y-3">
            {requirementTypes
              .filter((r) => r.category === key)
              .map((r) => {
                const done = (docs.files || docs).some((file) =>
                  String(file.requirement_type_id) === String(r.id) &&
                  (file.verification_status == null || file.verification_status === "accepted"),
                );
                return (
                  <li key={r.id} className="flex items-start gap-2.5">
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-primary-emphasis" />
                    ) : (
                      <Circle className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground/40" />
                    )}
                    <div className="min-w-0">
                      <p
                        className={`text-sm leading-snug ${done ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                      >
                        {r.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                        {r.note}
                      </p>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default InternshipRequirementsType;
