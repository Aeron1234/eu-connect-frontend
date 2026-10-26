"use client";
import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
// Derive one evaluation card's expansion, printing and deletion controls from the viewer.
// These flags describe UI affordances; the backend authorizes each action independently.
export default function usePostedEvaluation({ ev, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const { user } = useUser();
  const userId = user?.id || '';
  const userRole = user?.role || '';
  const isStaff = ['admin', 'department_head'].includes(userRole);
  // Performance Evaluation is employer-to-student; Supervisor Evaluation is
  // student-to-employer. Students never receive performance print controls.
  const canPrint = ev.type === 'Performance Evaluation' && (isStaff || (userRole === 'employer' && userId === ev.evaluator_id && !ev.deleted_at));
  // Authors can soft-delete their active evaluation. Staff controls appear only
  // for already deleted entries; the backend enforces department scope and purge eligibility.
  const canDelete = isStaff ? Boolean(ev.deleted_at) : !ev.deleted_at && userId === ev.evaluator_id &&
    ((userRole === 'employer' && ev.type === 'Performance Evaluation') || (userRole === 'student' && ev.type === 'Supervisor Evaluation'));
  return { open, setOpen, userId, isStaff, canPrint, canDelete,
    total: ev.breakdown.reduce((sum, item) => sum + item.score, 0),
    totalMax: ev.breakdown.reduce((sum, item) => sum + item.max, 0) };
}
