"use client";

import { useState, useTransition } from "react";
import { createInternshipRecord, updateOwnPendingInternshipRecord } from "@/lib/server-actions/internship-records-actions";
import { toastAndAction } from "@/lib/helpers";
import { internshipRecordFields } from "./internshipRecordFormData.mjs";

export default function useInternshipRecordForm({ recordStatus, onCreated, onUpdated, onConflict, activeRecord = null }) {
  const currentStatus = recordStatus || activeRecord?.status || "";
  const isCurrentRecord = currentStatus === "pending" || currentStatus === "ongoing";
  // Editing requires a saved pending record ID. Ongoing records stay read-only;
  // the backend rechecks the record's current status when saving.
  const canEdit = currentStatus === "pending" && Boolean(activeRecord?.id);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const isEditing = canEdit && editingRecordId === activeRecord.id;
  // Here status is the form's read-only flag, not the internship's status string.
  // Show saved values while locked and a separate draft during explicit editing.
  const status = isCurrentRecord && !isEditing;
  const [draft, setInternshipForm] = useState(() => internshipRecordFields(activeRecord || {}));
  const [draftRegion, setSelectedRegion] = useState(() => String(activeRecord?.region_id ?? ""));
  const [isPending, startTransition] = useTransition();
  const internshipForm = status && activeRecord ? internshipRecordFields(activeRecord) : draft;
  const selectedRegion = status ? String(activeRecord?.region_id ?? "") : draftRegion;

  function startEditing() {
    if (!canEdit || isPending) return;
    setInternshipForm(internshipRecordFields(activeRecord));
    setSelectedRegion(String(activeRecord.region_id ?? ""));
    setEditingRecordId(activeRecord.id);
  }

  function cancelEditing() {
    if (isPending) return;
    setInternshipForm(internshipRecordFields(activeRecord || {}));
    setSelectedRegion(String(activeRecord?.region_id ?? ""));
    setEditingRecordId(null);
  }

  function handleAction(formData) {
    if (status || isPending) return;
    formData.set("company_address", internshipForm.company_address);
    formData.set("lat", internshipForm.lat);
    formData.set("lon", internshipForm.lon);
    // Use a pending snapshot only after a successful write. The edit response supplies
    // the saved record when available; creation is reconciled by the parent's refetch.
    const submittedRecord = {
      ...internshipForm,
      ...(isEditing ? { id: activeRecord.id } : {}),
      region_id: formData.get("region_id") || selectedRegion,
      status: "pending",
    };
    const handlers = {
      loadingLabel: isEditing ? "Saving internship record..." : "Creating internship record...",
      successLabel: isEditing ? "Pending internship record updated." : "Good luck on your internship!",
      errorLabel: isEditing ? "Updating internship record failed." : "Creating internship record failed.",
      action: isEditing ? updateOwnPendingInternshipRecord : createInternshipRecord,
      args: isEditing ? [activeRecord.id, formData] : [formData],
    };
    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (result?.success) {
        if (isEditing) {
          const saved = result.record || submittedRecord;
          setInternshipForm(internshipRecordFields(saved));
          setSelectedRegion(String(saved.region_id ?? ""));
          onUpdated?.(saved);
          setEditingRecordId(null);
        } else {
          onCreated?.(submittedRecord);
          setInternshipForm(internshipRecordFields());
          setSelectedRegion("");
        }
      // A missing or changed record triggers reconciliation instead of reporting a saved edit.
      // Other failures preserve the draft for correction or retry.
      } else if (result?.refreshRecord) {
        onConflict?.();
      }
    });
  }

  return {
    status, canEdit, isEditing, isCurrentRecord, isPending, handleAction, startEditing, cancelEditing,
    fieldProps: { internshipForm, setInternshipForm, isPending, status },
    regionProps: { selectedRegion, setSelectedRegion },
  };
}
