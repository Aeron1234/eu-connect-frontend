"use client";

import {
  ClipboardList,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  addCriterion,
  deactivateCriterion,
  reactivateCriterion,
  deactivateSection,
  reactivateSection,
  getAllEvaluationCriteria,
} from "@/lib/server-actions/evaluations-actions";
import { cx } from "@/lib/utils";
import EvaluationCriteriaListSkeleton from "./EvaluationCriteriaListSkeleton";

// Backend returns [{ category, items: [{ id, name, is_active }] }].
function toSections(groups) {
  if (!Array.isArray(groups)) return [];
  return groups.map((g) => ({
    id: g.category,
    title: g.category,
    items: g.items.map((i) => ({
      id: i.id,
      label: i.name,
      is_active: i.is_active,
    })),
  }));
}

function buildFormData(fields) {
  const fd = new FormData();
  Object.entries(fields).forEach(([key, value]) => fd.append(key, value));
  return fd;
}

const FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const FORM_TYPES = [
  { value: "student", label: "Student" },
  { value: "employer", label: "Employer" },
];

export default function EvaluationCriteriaPageContent({
  initialCriteria = [],
}) {
  const [formType, setFormType] = useState("student");
  const [filter, setFilter] = useState("all");
  const [sections, setSections] = useState(() => toSections(initialCriteria));
  const [error, setError] = useState(null);
  const [newSection, setNewSection] = useState("");
  // Sections created locally with no criteria yet — a category only exists
  // in the DB once it has ≥1 criterion, so these live here until their
  // first criterion is actually saved.
  const [draftSections, setDraftSections] = useState([]);

  const [isPending, startTransition] = useTransition();
  // Which specific button triggered the in-flight transition, so only that
  // one shows a spinner/disabled state instead of the whole page.
  const [activeKey, setActiveKey] = useState(null);
  const isKeyPending = (key) => isPending && activeKey === key;

  // Separate from the mutation transition above — this is specifically for
  // switching between Student/Employer tabs, which needs a real fetch.
  const [isSwitchingType, setIsSwitchingType] = useState(false);
  const typeRequestIdRef = useRef(0);
  const isFirstTypeRun = useRef(true);

  // Debounced fetch whenever formType changes — mirrors the pattern used
  // in EvaluationsManager. `filter` (All/Active/Inactive) does NOT trigger
  // this; it's applied client-side below against data already on hand.
  useEffect(() => {
    if (isFirstTypeRun.current) {
      isFirstTypeRun.current = false;
      return;
    }

    const thisRequestId = ++typeRequestIdRef.current;

    const timeout = setTimeout(async () => {
      setIsSwitchingType(true);
      try {
        const result = await getAllEvaluationCriteria({ type: formType });

        if (thisRequestId !== typeRequestIdRef.current) return;

        setSections(toSections(result));
        setDraftSections([]);
        setError(null);
      } catch (err) {
        if (thisRequestId === typeRequestIdRef.current) {
          console.error("Error loading evaluation criteria:", err);
          setError("Failed to load criteria. Please try again.");
        }
      } finally {
        if (thisRequestId === typeRequestIdRef.current) {
          setIsSwitchingType(false);
        }
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [formType]);

  // Runs a server action outside of a <form>, applying an optimistic UI
  // update immediately and rolling it back only if the action reports an
  // error. `onError` receives the pre-mutation snapshot to restore.
  const runAction = (key, action, fields, onError) => {
    setActiveKey(key);
    setError(null);
    startTransition(async () => {
      const result = await action(null, buildFormData(fields));
      if (result?.error) {
        setError(result.error);
        onError?.();
      }
      setActiveKey(null);
    });
  };

  const addCriterionHandler = (category, label) => {
    const snapshot = sections;
    const wasDraft = draftSections.some((s) => s.title === category);
    const tempId = `temp-${Date.now()}`;

    if (wasDraft) {
      setDraftSections((d) => d.filter((s) => s.title !== category));
      setSections((prev) => [
        ...prev,
        {
          id: category,
          title: category,
          items: [{ id: tempId, label, is_active: true }],
        },
      ]);
    } else {
      setSections((prev) =>
        prev.map((s) =>
          s.title === category
            ? {
                ...s,
                items: [...s.items, { id: tempId, label, is_active: true }],
              }
            : s,
        ),
      );
    }

    runAction(
      `add:${category}`,
      addCriterion,
      { category, type: formType, criterion_name: label },
      () => {
        setSections(snapshot);
        if (wasDraft) {
          setDraftSections((d) => [
            ...d,
            { id: category, title: category, items: [] },
          ]);
        }
      },
    );
  };

  const deactivateCriterionHandler = (id) => {
    const snapshot = sections;
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        items: s.items.map((i) =>
          i.id === id ? { ...i, is_active: false } : i,
        ),
      })),
    );
    runAction(
      `criterion:${id}`,
      deactivateCriterion,
      { id, type: formType },
      () => setSections(snapshot),
    );
  };

  const reactivateCriterionHandler = (id) => {
    const snapshot = sections;
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        items: s.items.map((i) =>
          i.id === id ? { ...i, is_active: true } : i,
        ),
      })),
    );
    runAction(
      `criterion:${id}`,
      reactivateCriterion,
      { id, type: formType },
      () => setSections(snapshot),
    );
  };

  const deactivateSectionHandler = (category) => {
    const snapshot = sections;
    setSections((prev) =>
      prev.map((s) =>
        s.title === category
          ? { ...s, items: s.items.map((i) => ({ ...i, is_active: false })) }
          : s,
      ),
    );
    runAction(
      `section:${category}`,
      deactivateSection,
      { category, type: formType },
      () => setSections(snapshot),
    );
  };

  const reactivateSectionHandler = (category) => {
    const snapshot = sections;
    setSections((prev) =>
      prev.map((s) =>
        s.title === category
          ? { ...s, items: s.items.map((i) => ({ ...i, is_active: true })) }
          : s,
      ),
    );
    runAction(
      `reactivate-section:${category}`,
      reactivateSection,
      { category, type: formType },
      () => setSections(snapshot),
    );
  };

  // Overall stats — always computed from the full (unfiltered) data.
  const totals = useMemo(() => {
    const all = [...sections, ...draftSections];
    const activeCriteria = all.reduce(
      (n, s) => n + s.items.filter((i) => i.is_active).length,
      0,
    );
    return { sections: all.length, criteria: activeCriteria };
  }, [sections, draftSections]);

  // What's actually rendered, filtered by `filter` — purely client-side,
  // no fetch involved since we already have the full dataset for this type.
  const visibleSections = useMemo(() => {
    const applyFilter = (items) => {
      if (filter === "active") return items.filter((i) => i.is_active);
      if (filter === "inactive") return items.filter((i) => !i.is_active);
      return items;
    };

    const filteredPersisted = sections
      .map((s) => ({ ...s, items: applyFilter(s.items) }))
      .filter((s) => filter === "all" || s.items.length > 0);

    return [...filteredPersisted, ...draftSections];
  }, [sections, draftSections, filter]);

  const addSection = () => {
    const title = newSection.trim();
    if (!title) return;
    if (
      sections.some((s) => s.title === title) ||
      draftSections.some((s) => s.title === title)
    ) {
      setError("A section with that name already exists.");
      return;
    }
    setDraftSections((d) => [...d, { id: title, title, items: [] }]);
    setNewSection("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg bg-secondary p-1">
          {FORM_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setFormType(t.value)}
              className={`rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap flex-1 text-center ${
                formType === t.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-primary-emphasis"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-6 text-sm">
          <Stat label="Sections" value={totals.sections} />
          <Stat label="Active Criteria" value={totals.criteria} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cx(
              "rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors",
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-primary-emphasis",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {isSwitchingType ? (
        <EvaluationCriteriaListSkeleton />
      ) : (
        <>
          <div className="space-y-4">
            {visibleSections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                isKeyPending={isKeyPending}
                onAddCriterion={addCriterionHandler}
                onDeactivateCriterion={deactivateCriterionHandler}
                onReactivateCriterion={reactivateCriterionHandler}
                onDeactivateSection={deactivateSectionHandler}
                onReactivateSection={reactivateSectionHandler}
              />
            ))}

            {visibleSections.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
                <ClipboardList className="size-8 text-foreground-faint" />
                <p className="text-sm text-muted-foreground">
                  {filter === "all"
                    ? "No criteria yet. Add your first section below."
                    : `No ${filter} criteria found.`}
                </p>
              </div>
            )}
          </div>

          {/* Add section (local placeholder — persists once its first criterion is added) */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row">
            <input
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSection()}
              placeholder="New section title (e.g. Communication Skills)"
              className="flex-1 rounded-lg border border-border bg-card px-3 sm:px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addSection}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 sm:px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add Section
            </button>
          </div>
          <p className="-mt-3 text-xs text-muted-foreground">
            A new section is only saved once you add its first criterion below.
          </p>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold text-primary-emphasis">{value}</p>
    </div>
  );
}

function SectionCard({
  section,
  isKeyPending,
  onAddCriterion,
  onDeactivateCriterion,
  onReactivateCriterion,
  onDeactivateSection,
  onReactivateSection,
}) {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  const activeCount = section.items.filter((i) => i.is_active).length;
  const hasInactive = section.items.some((i) => !i.is_active);
  const isPersisted = section.items.length > 0;

  const submitNewCriterion = () => {
    if (!newLabel.trim()) return;
    onAddCriterion(section.title, newLabel.trim());
    setNewLabel("");
    setAdding(false);
  };

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 sm:px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <ClipboardList className="h-4 w-4 flex-shrink-0 text-primary-emphasis" />
          <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
            {section.title}
          </h2>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-primary-emphasis whitespace-nowrap">
            {activeCount} active criteria
          </span>
          {!isPersisted && (
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600 whitespace-nowrap">
              Unsaved
            </span>
          )}
        </div>

        {isPersisted && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {hasInactive && (
              <IconBtn
                title="Reactivate all inactive criteria in this section"
                disabled={isKeyPending(`reactivate-section:${section.title}`)}
                pending={isKeyPending(`reactivate-section:${section.title}`)}
                onClick={() => onReactivateSection(section.title)}
              >
                <RotateCcw className="h-4 w-4" />
              </IconBtn>
            )}
            {activeCount > 0 && (
              <IconBtn
                title="Deactivate all criteria in this section"
                danger
                disabled={isKeyPending(`section:${section.title}`)}
                pending={isKeyPending(`section:${section.title}`)}
                onClick={() => onDeactivateSection(section.title)}
              >
                <Trash2 className="h-4 w-4" />
              </IconBtn>
            )}
          </div>
        )}
      </header>

      <ul className="divide-y divide-border">
        {section.items.map((item) => {
          const key = `criterion:${item.id}`;
          return (
            <li
              key={item.id}
              className={`flex items-center gap-3 px-4 sm:px-5 py-3 ${
                item.is_active ? "" : "opacity-50"
              }`}
            >
              <span className="flex-1 min-w-0 text-sm text-foreground line-clamp-2">
                {item.label}
              </span>
              {!item.is_active && (
                <span className="flex-shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Inactive
                </span>
              )}
              {item.is_active ? (
                <IconBtn
                  title="Deactivate criterion"
                  danger
                  disabled={isKeyPending(key)}
                  pending={isKeyPending(key)}
                  onClick={() => onDeactivateCriterion(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </IconBtn>
              ) : (
                <IconBtn
                  title="Reactivate criterion"
                  disabled={isKeyPending(key)}
                  pending={isKeyPending(key)}
                  onClick={() => onReactivateCriterion(item.id)}
                >
                  <RotateCcw className="h-4 w-4" />
                </IconBtn>
              )}
            </li>
          );
        })}

        {section.items.length === 0 && !adding && (
          <li className="px-4 sm:px-5 py-4 text-sm text-muted-foreground">
            No criteria in this section yet.
          </li>
        )}

        {adding && (
          <li className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3">
            <input
              autoFocus
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitNewCriterion()}
              placeholder="Criterion description"
              className="flex-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={submitNewCriterion}
                disabled={isKeyPending(`add:${section.title}`)}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
              >
                {isKeyPending(`add:${section.title}`) ? "Saving…" : "Save"}
              </button>
              <IconBtn
                title="Cancel"
                onClick={() => {
                  setNewLabel("");
                  setAdding(false);
                }}
              >
                <X className="h-4 w-4" />
              </IconBtn>
            </div>
          </li>
        )}
      </ul>

      {!adding && (
        <div className="border-t border-border px-4 sm:px-5 py-3">
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-emphasis hover:underline"
          >
            <Plus className="h-4 w-4" /> Add criterion
          </button>
        </div>
      )}
    </section>
  );
}

function IconBtn({ children, onClick, title, danger, disabled, pending }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "text-foreground-subtle hover:bg-red-50 hover:text-red-600"
          : "text-foreground-subtle hover:bg-muted hover:text-primary-emphasis"
      }`}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}
