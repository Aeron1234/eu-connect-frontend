"use client";

import { notifyReadError } from "@/lib/client-read-error";

import {
  ClipboardList,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { evaluationCriteriaKeys, evaluationCriteriaOptions } from "@/lib/cache/evaluation-criteria-queries";
import {
  addCriterion,
  deactivateCriterion,
  reactivateCriterion,
  deactivateSection,
  reactivateSection,
} from "@/lib/server-actions/evaluations-actions";
import { cx } from "@/lib/utils";
import EvaluationCriteriaListSkeleton from "../skeletons/EvaluationCriteriaListSkeleton";

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

function addToGroups(groups, category, item) {
  if (groups.some((group) => group.category === category)) {
    return groups.map((group) => group.category === category
      ? { ...group, items: [...group.items, item] }
      : group);
  }
  return [...groups, { category, items: [item] }]
    .sort((a, b) => a.category.localeCompare(b.category));
}

function setCriterionActive(groups, id, isActive) {
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => item.id === id
      ? { ...item, is_active: isActive }
      : item),
  }));
}

function setSectionActive(groups, category, isActive) {
  return groups.map((group) => group.category === category
    ? { ...group, items: group.items.map((item) => ({ ...item, is_active: isActive })) }
    : group);
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
  const { user } = useUser();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const serverSnapshotRef = useRef(initialCriteria);
  const [formType, setFormType] = useState("student");
  const [activeType, setActiveType] = useState("student");
  const [filter, setFilter] = useState("all");
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

  // Student and Employer have separate cache entries.
  const criteriaQuery = useQuery({
    ...evaluationCriteriaOptions(userId, activeType),
    enabled: Boolean(userId),
    initialData: activeType === "student" && Array.isArray(initialCriteria)
      ? initialCriteria
      : undefined,
  });
  const sections = useMemo(() => toSections(criteriaQuery.data), [criteriaQuery.data]);
  const isSwitchingType = formType !== activeType || criteriaQuery.isPending;

  // Delay only uncached type switches; status filters are applied locally.
  useEffect(() => {
    if (formType === activeType) return;
    const timeout = setTimeout(() => setActiveType(formType), 300);
    return () => clearTimeout(timeout);
  }, [formType, activeType]);

  useEffect(() => {
    if (criteriaQuery.error) notifyReadError("Error loading evaluation criteria:", criteriaQuery.error);
  }, [criteriaQuery.error]);

  useEffect(() => {
    if (serverSnapshotRef.current === initialCriteria || !userId) return;
    serverSnapshotRef.current = initialCriteria;
    queryClient.setQueryData(evaluationCriteriaKeys.type(userId, "student"), initialCriteria);
  }, [initialCriteria, queryClient, userId]);

  function handleTypeChange(type) {
    if (type === formType || isPending) return;
    setFormType(type);
    setDraftSections([]);
    setError(null);
    if (userId && queryClient.getQueryData(evaluationCriteriaKeys.type(userId, type))) {
      setActiveType(type);
    }
  }

  // Mutations update the active cache optimistically and restore it on failure.
  const runAction = (key, action, fields, update, { onError, onSuccess } = {}) => {
    const queryKey = evaluationCriteriaKeys.type(userId, activeType);
    void queryClient.cancelQueries({ queryKey, exact: true });
    const previous = queryClient.getQueryData(queryKey);
    queryClient.setQueryData(queryKey, (current = []) => update(current));
    setActiveKey(key);
    setError(null);
    startTransition(async () => {
      try {
        const result = await action(null, buildFormData(fields));
        if (!result?.success) {
          queryClient.setQueryData(queryKey, previous);
          setError(result?.error || "Could not update criteria. Please try again.");
          onError?.();
          return;
        }
        onSuccess?.(result, queryKey);
        await queryClient.invalidateQueries({ queryKey, exact: true });
      } catch (err) {
        queryClient.setQueryData(queryKey, previous);
        setError(err?.message || "Could not update criteria. Please try again.");
        onError?.();
      } finally {
        setActiveKey(null);
      }
    });
  };

  const addCriterionHandler = (category, label) => {
    const wasDraft = draftSections.some((s) => s.title === category);
    const tempId = `temp-${Date.now()}`;

    if (wasDraft) {
      setDraftSections((d) => d.filter((s) => s.title !== category));
    }

    runAction(
      `add:${category}`,
      addCriterion,
      { category, type: activeType, criterion_name: label },
      (groups) => addToGroups(groups, category, { id: tempId, name: label, is_active: true }),
      {
        onError: () => {
          if (!wasDraft) return;
          setDraftSections((d) => [
            ...d,
            { id: category, title: category, items: [] },
          ]);
        },
        onSuccess: (result, queryKey) => {
          if (result.id == null) return;
          queryClient.setQueryData(queryKey, (groups = []) => groups.map((group) => ({
            ...group,
            items: group.items.map((item) => item.id === tempId
              ? { ...item, id: result.id }
              : item),
          })));
        },
      },
    );
  };

  const deactivateCriterionHandler = (id) => {
    runAction(
      `criterion:${id}`,
      deactivateCriterion,
      { id, type: activeType },
      (groups) => setCriterionActive(groups, id, false),
    );
  };

  const reactivateCriterionHandler = (id) => {
    runAction(
      `criterion:${id}`,
      reactivateCriterion,
      { id, type: activeType },
      (groups) => setCriterionActive(groups, id, true),
    );
  };

  const deactivateSectionHandler = (category) => {
    runAction(
      `section:${category}`,
      deactivateSection,
      { category, type: activeType },
      (groups) => setSectionActive(groups, category, false),
    );
  };

  const reactivateSectionHandler = (category) => {
    runAction(
      `reactivate-section:${category}`,
      reactivateSection,
      { category, type: activeType },
      (groups) => setSectionActive(groups, category, true),
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
              onClick={() => handleTypeChange(t.value)}
              disabled={isPending}
              className={`rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap flex-1 text-center disabled:opacity-50 ${
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

      {!isSwitchingType && criteriaQuery.error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <span>{criteriaQuery.error.message || "Could not load evaluation criteria."}</span>
          <button type="button" onClick={() => criteriaQuery.refetch()} className="font-semibold text-primary-emphasis hover:underline">Try again</button>
        </div>
      )}

      {isSwitchingType ? (
        <EvaluationCriteriaListSkeleton />
      ) : criteriaQuery.error && !criteriaQuery.data ? null
      : (
        <>
          <div className="space-y-4">
            {visibleSections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                isKeyPending={isKeyPending}
                isMutationPending={isPending}
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
  isMutationPending,
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
                disabled={isMutationPending}
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
                disabled={isMutationPending}
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
                  disabled={isMutationPending || String(item.id).startsWith("temp-")}
                  pending={isKeyPending(key)}
                  onClick={() => onDeactivateCriterion(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </IconBtn>
              ) : (
                <IconBtn
                  title="Reactivate criterion"
                  disabled={isMutationPending || String(item.id).startsWith("temp-")}
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
                disabled={isMutationPending}
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
            disabled={isMutationPending}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-emphasis hover:underline disabled:opacity-50"
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
