import { Building2, Calendar, MessageSquare, User } from "lucide-react";

const evaluationCategories = [
  {
    name: "Personality",
    items: ["Grooming", "Physical Manners", "Voice and Diction", "Hygiene"],
  },
  {
    name: "Work Attitude",
    items: [
      "Attendance",
      "Punctuality",
      "Willingness to Accept Work",
      "Can Work Hard and Concentrate",
      "Willingness to Work on Extended Hours",
      "Cooperative to Officemates",
      "Has Self-Discipline",
      "Honest and Trustworthy",
    ],
  },
  {
    name: "Work Organization",
    items: [
      "Accurate and Thorough",
      "Checks and Prioritizes Materials",
      "Keeps Materials Properly Arranged",
      "Finishes Assigned Tasks on Time",
      "Shows Creativity",
      "Can Detect and Correct Errors",
      "Work Is Presentable and Acceptable",
      "Consistent Rate of Work",
      "Judgment Under Stress",
    ],
  },
  {
    name: "Job Knowledge",
    items: [
      "Learned About His/Her Job",
      "Knows Functions and Responsibilities",
      "Can Grasp Situations and Draw Conclusions",
    ],
  },
  {
    name: "Social Attitude",
    items: ["Friendly", "Shows Sincerity", "Polite and Tactful"],
  },
  {
    name: "Efficiency",
    items: [
      "Typing, Filing, Organization Works",
      "Communication (Telephone, Reception, etc.)",
    ],
  },
];

const generateScores = (items, base) => {
  const scores = {};
  items.forEach((item, i) => {
    scores[item] = Math.min(
      5,
      Math.max(3, base + (i % 3 === 0 ? 0 : i % 2 === 0 ? -1 : 1)),
    );
  });
  return scores;
};

const mockEvaluations = [
  {
    evaluator: "Mr. Rayleigh Silvers",
    company: "Accenture Philippines",
    role: "Company OJT Supervisor",
    date: "2026-03-19",
    categories: Object.fromEntries(
      evaluationCategories.map((cat) => [
        cat.name,
        generateScores(cat.items, 5),
      ]),
    ),
    remarks:
      "Excellent intern. Shows great initiative and leadership qualities.",
  },
  {
    evaluator: "Ms. Nico Robin",
    company: "Globe Telecom",
    role: "Department Manager",
    date: "2026-02-28",
    categories: Object.fromEntries(
      evaluationCategories.map((cat) => [
        cat.name,
        generateScores(cat.items, 4),
      ]),
    ),
    remarks:
      "Very reliable and communicates well with the team. A pleasure to work with.",
  },
];

const getCategoryAvg = (scores) => {
  const vals = Object.values(scores);
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
};

const getOverallAvg = (categories) => {
  const allScores = Object.values(categories).flatMap((s) => Object.values(s));
  return (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1);
};

const GradeBadge = ({ value }) => {
  const color =
    value >= 5
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      : value >= 4
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        : value >= 3
          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-7 rounded-md text-xs font-bold ${color}`}
    >
      {value}
    </span>
  );
};

const EvaluationCard = ({ ev }) => (
  <div className="border border-border rounded-xl bg-card overflow-hidden">
    {/* Header */}
    <div className="px-5 py-4 bg-muted/40 border-b border-border flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {ev.evaluator}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="w-3 h-3" />
            <span>{ev.company}</span>
            <span className="text-muted-foreground/40">•</span>
            <span className="italic">{ev.role}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Overall
          </p>
          <p className="text-lg font-bold text-primary">
            {getOverallAvg(ev.categories)}
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{ev.date}</span>
        </div>
      </div>
    </div>

    {/* Categories */}
    <div className="p-5 space-y-4">
      {Object.entries(ev.categories).map(([catName, scores]) => (
        <div key={catName}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold text-primary-foreground bg-primary rounded px-2.5 py-0.5">
              {catName}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Avg: {getCategoryAvg(scores)}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5">
            {Object.entries(scores).map(([item, score]) => (
              <div
                key={item}
                className="flex items-center justify-between gap-2 py-0.5"
              >
                <span className="text-sm text-foreground/80 truncate">
                  {item}
                </span>
                <GradeBadge value={score} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* Remarks */}
    {ev.remarks && (
      <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-start gap-2">
        <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground italic">
          &quot;{ev.remarks}&quot;
        </p>
      </div>
    )}
  </div>
);

function Evaluations() {
  return (
    <main className="flex-1 p-4 sm:p-6 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Evaluations</h1>
          <p className="text-sm text-muted-foreground">
            Performance evaluations from supervisors and employers.
          </p>
        </div>
        <div className="space-y-5">
          {mockEvaluations.map((ev, i) => (
            <EvaluationCard key={i} ev={ev} />
          ))}
        </div>
      </div>
    </main>
  );
}

export default Evaluations;
