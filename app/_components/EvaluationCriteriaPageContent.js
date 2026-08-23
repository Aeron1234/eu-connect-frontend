"use client";

import {
  Check,
  ClipboardList,
  GripVertical,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

// ---- Mock data (stand-in for a real API/database) ----
const seed = {
  student: [
    {
      id: 1,
      title: "Personality",
      items: [
        { id: 11, label: "Grooming and Personal Appearance", points: 5 },
        { id: 12, label: "Physical Manners and Bearing", points: 5 },
        { id: 13, label: "Emotional Maturity", points: 5 },
        { id: 14, label: "Self-Confidence", points: 5 },
      ],
    },
    {
      id: 2,
      title: "Work Attitude",
      items: [
        { id: 21, label: "Punctuality and Attendance", points: 10 },
        { id: 22, label: "Interest and Enthusiasm in Work", points: 10 },
        { id: 23, label: "Willingness to Accept Assignments", points: 10 },
        { id: 24, label: "Responsibility and Accountability", points: 10 },
      ],
    },
    {
      id: 3,
      title: "Work Organization",
      items: [
        { id: 31, label: "Planning and Prioritization of Tasks", points: 15 },
        { id: 32, label: "Quality and Accuracy of Output", points: 15 },
        { id: 33, label: "Care of Tools and Equipment", points: 15 },
      ],
    },
    {
      id: 4,
      title: "Job Knowledge",
      items: [{ id: 41, label: "Understanding of Assigned Work", points: 15 }],
    },
    {
      id: 5,
      title: "Social Attitude",
      items: [{ id: 51, label: "Cooperation with Co-Workers", points: 15 }],
    },
    {
      id: 6,
      title: "Efficiency",
      items: [{ id: 61, label: "Volume of Work Accomplished", points: 10 }],
    },
  ],
  employer: [
    {
      id: 101,
      title: "Supervision and Guidance",
      items: [
        {
          id: 1011,
          label: "Provides Clear Instructions and Expectations",
          points: 5,
        },
        {
          id: 1012,
          label: "Available for Questions and Consultation",
          points: 5,
        },
        { id: 1013, label: "Gives Constructive Feedback on Output", points: 5 },
        { id: 1014, label: "Monitors Progress of Assigned Tasks", points: 5 },
      ],
    },
    {
      id: 102,
      title: "Training and Learning Opportunities",
      items: [
        { id: 1021, label: "Assigns Tasks Relevant to the Course", points: 5 },
        {
          id: 1022,
          label: "Provides Orientation on Company Processes",
          points: 5,
        },
        { id: 1023, label: "Encourages Skill Development", points: 5 },
        {
          id: 1024,
          label: "Allows Exposure to Actual Work Situations",
          points: 5,
        },
      ],
    },
    {
      id: 103,
      title: "Work Environment",
      items: [
        { id: 1031, label: "Safe and Conducive Workplace", points: 5 },
        {
          id: 1032,
          label: "Adequate Tools, Equipment and Workspace",
          points: 5,
        },
        {
          id: 1033,
          label: "Respectful and Professional Treatment of Interns",
          points: 5,
        },
        { id: 1034, label: "Reasonable Workload and Schedule", points: 5 },
      ],
    },
    {
      id: 104,
      title: "Professionalism",
      items: [
        { id: 1041, label: "Punctual and Consistent in Presence", points: 5 },
        { id: 1042, label: "Fair and Objective in Assessment", points: 5 },
        { id: 1043, label: "Approachable and Open to Suggestions", points: 5 },
      ],
    },
  ],
};

let nextId = 9000;
const uid = () => ++nextId;

export default function EvaluationCriteriaPageContent() {
  const [form, setForm] = useState("student");
  const [data, setData] = useState(seed);
  const [newSection, setNewSection] = useState("");

  const sections = data[form];
  const update = (fn) => setData((d) => ({ ...d, [form]: fn(d[form]) }));

  const totals = useMemo(
    () => ({
      sections: sections.length,
      criteria: sections.reduce((n, s) => n + s.items.length, 0),
      points: sections.reduce(
        (n, s) => n + s.items.reduce((m, i) => m + i.points, 0),
        0,
      ),
    }),
    [sections],
  );

  // ---- Section CRUD (create/delete only — no rename)
  const addSection = () => {
    const title = newSection.trim();
    if (!title) return;
    update((s) => [...s, { id: uid(), title, items: [] }]);
    setNewSection("");
  };
  const deleteSection = (id) => update((s) => s.filter((x) => x.id !== id));

  // ---- Criterion CRUD (create/delete only — no edit)
  const addCriterion = (sectionId, label, points) =>
    update((s) =>
      s.map((x) =>
        x.id === sectionId
          ? { ...x, items: [...x.items, { id: uid(), label, points }] }
          : x,
      ),
    );
  const deleteCriterion = (sectionId, id) =>
    update((s) =>
      s.map((x) =>
        x.id === sectionId
          ? { ...x, items: x.items.filter((i) => i.id !== id) }
          : x,
      ),
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg bg-stone-50 p-1">
          {[
            { key: "student", label: "Student Performance" },
            { key: "employer", label: "Employer / Supervisor" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setForm(t.key)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                form === t.key
                  ? "bg-primary-500 text-primary-foreground shadow-sm"
                  : "text-stone-600 hover:text-primary-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-6 text-sm">
          <Stat label="Sections" value={totals.sections} />
          <Stat label="Criteria" value={totals.criteria} />
          <Stat label="Total Points" value={totals.points} />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            onDeleteSection={deleteSection}
            onAddCriterion={addCriterion}
            onDeleteCriterion={deleteCriterion}
          />
        ))}

        {sections.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-background p-10 text-center text-sm text-stone-500">
            No criteria yet. Add your first section below.
          </div>
        )}
      </div>

      {/* Add section */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row">
        <input
          value={newSection}
          onChange={(e) => setNewSection(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSection()}
          placeholder="New section title (e.g. Communication Skills)"
          className="flex-1 rounded-lg border border-border bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-primary-500"
        />
        <button
          type="button"
          onClick={addSection}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add Section
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-stone-500">{label}</p>
      <p className="font-display text-xl font-bold text-primary-500">{value}</p>
    </div>
  );
}

function SectionCard({
  section,
  onDeleteSection,
  onAddCriterion,
  onDeleteCriterion,
}) {
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({ label: "", points: "5" });

  const sectionPoints = section.items.reduce((n, i) => n + i.points, 0);

  return (
    <section className="rounded-xl border border-border bg-background">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary-500" />
          <h2 className="font-display text-base font-bold text-stone-800">
            {section.title}
          </h2>
          <span className="rounded-full bg-stone-50 px-2.5 py-0.5 text-xs font-semibold text-primary-500">
            {section.items.length} criteria · {sectionPoints} pts
          </span>
        </div>

        <div className="flex items-center gap-1">
          <IconBtn
            title="Delete section"
            danger
            onClick={() => onDeleteSection(section.id)}
          >
            <Trash2 className="h-4 w-4" />
          </IconBtn>
        </div>
      </header>

      <ul className="divide-y divide-border">
        {section.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 px-5 py-3">
            <GripVertical className="h-4 w-4 shrink-0 text-stone-300" />
            <span className="flex-1 text-sm text-stone-700">{item.label}</span>
            <span className="rounded-md bg-stone-50 px-2 py-0.5 text-xs font-semibold text-primary-500">
              {item.points} pts
            </span>
            <IconBtn
              title="Delete criterion"
              danger
              onClick={() => onDeleteCriterion(section.id, item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </IconBtn>
          </li>
        ))}

        {section.items.length === 0 && !adding && (
          <li className="px-5 py-4 text-sm text-stone-500">
            No criteria in this section yet.
          </li>
        )}

        {adding && (
          <li className="flex items-center gap-3 px-5 py-3">
            <input
              autoFocus
              value={newItem.label}
              onChange={(e) =>
                setNewItem({ ...newItem, label: e.target.value })
              }
              placeholder="Criterion description"
              className="flex-1 rounded-lg border border-border bg-stone-50 px-3 py-1.5 text-sm outline-none focus:border-primary-500"
            />
            <input
              type="number"
              min={0}
              value={newItem.points}
              onChange={(e) =>
                setNewItem({ ...newItem, points: e.target.value })
              }
              className="w-20 rounded-lg border border-border bg-stone-50 px-3 py-1.5 text-sm outline-none focus:border-primary-500"
            />
            <IconBtn
              title="Save"
              onClick={() => {
                if (newItem.label.trim()) {
                  onAddCriterion(
                    section.id,
                    newItem.label.trim(),
                    Number(newItem.points) || 0,
                  );
                }
                setNewItem({ label: "", points: "5" });
                setAdding(false);
              }}
            >
              <Check className="h-4 w-4" />
            </IconBtn>
            <IconBtn
              title="Cancel"
              onClick={() => {
                setNewItem({ label: "", points: "5" });
                setAdding(false);
              }}
            >
              <X className="h-4 w-4" />
            </IconBtn>
          </li>
        )}
      </ul>

      {!adding && (
        <div className="border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-500 hover:underline"
          >
            <Plus className="h-4 w-4" /> Add criterion
          </button>
        </div>
      )}
    </section>
  );
}

function IconBtn({ children, onClick, title, danger }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`rounded-md p-1.5 transition-colors ${
        danger
          ? "text-stone-400 hover:bg-rose-50 hover:text-rose-600"
          : "text-stone-400 hover:bg-stone-50 hover:text-primary-500"
      }`}
    >
      {children}
    </button>
  );
}
