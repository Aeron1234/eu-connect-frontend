"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { notifyReadError } from "@/lib/client-read-error";
import { evaluationCriteriaKeys, evaluationCriteriaOptions } from "@/lib/cache/evaluation-criteria-queries";
import {
  addCriterion, deactivateCriterion, reactivateCriterion,
  deactivateSection, reactivateSection,
} from "@/lib/server-actions/evaluations-actions";
import {
  toSections, buildFormData, addToGroups, setCriterionActive, setSectionActive,
} from "./evaluationCriteriaState";

// Manage criteria queries, unsaved sections, filtering and optimistic activation edits.
// Keep draft-only section identities separate from persisted criterion IDs.
export default function useEvaluationCriteriaManager(initialCriteria) {
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
  // Identify the triggering control for its spinner. Other mutation controls
  // remain disabled through the shared isPending state.
  const [activeKey, setActiveKey] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const isKeyPending = (key) => isPending && activeKey === key;

  // Cache criteria separately per viewer and evaluation target type.
  const criteriaQuery = useQuery({
    ...evaluationCriteriaOptions(userId, activeType),
    enabled: Boolean(userId),
    initialData: activeType === "student" && Array.isArray(initialCriteria)
      ? initialCriteria
      : undefined,
  });
  const sections = useMemo(() => toSections(criteriaQuery.data), [criteriaQuery.data]);
  const isSwitchingType = formType !== activeType || criteriaQuery.isPending;

  // Cached types switch immediately in handleTypeChange; uncached types wait 300 ms.
  // Active/inactive filters use the loaded data without another request.
  useEffect(() => {
    if (formType === activeType) return;
    const timeout = setTimeout(() => setActiveType(formType), 300);
    return () => clearTimeout(timeout);
  }, [formType, activeType]);

  useEffect(() => {
    if (criteriaQuery.error && criteriaQuery.data) notifyReadError("Error loading evaluation criteria:", criteriaQuery.error);
  }, [criteriaQuery.error, criteriaQuery.data]);

  useEffect(() => {
    if (!Array.isArray(initialCriteria) || serverSnapshotRef.current === initialCriteria || !userId) return;
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

  // Snapshot and optimistically update only this viewer/type cache. Restore it on
  // returned or thrown failure, and refetch the canonical groups after success.
  const runAction = (key, action, fields, update, { onError, onSuccess } = {}) => {
    const queryKey = evaluationCriteriaKeys.type(userId, activeType);
    void queryClient.cancelQueries({ queryKey, exact: true });
    const previous = queryClient.getQueryData(queryKey);
    queryClient.setQueryData(queryKey, (current = []) => update(current));
    setActiveKey(key);
    setError(null);
    startTransition(async () => {
      try {
        const result = await action(buildFormData(fields));
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
      (groups) => addToGroups(groups, category, { id: tempId, name: label, is_active: true }, activeType === "student"),
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
          // Replace the temporary criterion ID with the saved ID before the refetch.
          // Temporary rows cannot receive further activation/deactivation actions.
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

  // Counts ignore the active/inactive filter: sections include local drafts,
  // while the criteria count includes active items only.
  const totals = useMemo(() => {
    const all = [...sections, ...draftSections];
    const activeCriteria = all.reduce(
      (n, s) => n + s.items.filter((i) => i.is_active).length,
      0,
    );
    return { sections: all.length, criteria: activeCriteria };
  }, [sections, draftSections]);

  // Filter persisted items locally. Keep unsaved draft sections visible under
  // every filter so a new section can receive its first criterion.
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
    const title = formType === "student"
      ? newSection.trim().replace(/^\d+\.\s*/, "").trim()
      : newSection.trim();
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

  return {
    criteriaQuery,
    filter,
    error,
    setError,
    isSwitchingType,
    visibleSections,
    toolbarProps: {
      formType, handleTypeChange, isPending, totals, filter, setFilter,
    },
    sectionFormProps: { newSection, setNewSection, addSection },
    sectionActions: {
      isKeyPending,
      isMutationPending: isPending,
      onAddCriterion: addCriterionHandler,
      onDeactivateCriterion: (item) => setConfirmation({
        title: "Deactivate criterion?",
        description: `Deactivate “${item.label}”? It will no longer be offered for new evaluations.`,
        action: () => deactivateCriterionHandler(item.id),
      }),
      onDeactivateSection: (category) => setConfirmation({
        title: "Deactivate section?",
        description: `Deactivate every active criterion in “${category}”?`,
        action: () => deactivateSectionHandler(category),
      }),
      onReactivateCriterion: reactivateCriterionHandler,
      onReactivateSection: reactivateSectionHandler,
    },
    confirmationProps: {
      open: Boolean(confirmation),
      onOpenChange: (open) => {
        if (!open) setConfirmation(null);
      },
      onConfirm: () => {
        confirmation?.action();
        setConfirmation(null);
      },
      title: confirmation?.title || "Deactivate criteria?",
      description: confirmation?.description || "The selected criteria will no longer be available for new evaluations.",
      confirmLabel: "Deactivate",
      destructive: true,
      pending: isPending,
    },
  };
}
