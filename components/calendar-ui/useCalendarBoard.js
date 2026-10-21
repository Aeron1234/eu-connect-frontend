"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { socket } from "@/components/ui/SocketProvider";
import { calendarKeys, calendarMonthOptions, isCalendarMonth } from "@/lib/cache/calendar-queries";
import {
  createCalendarTodo,
  updateCalendarTodo,
  deleteCalendarTodo,
  createCalendarSchedule,
  updateCalendarSchedule,
  deleteCalendarSchedule,
} from "@/lib/server-actions/calendar-actions";
import { kinds, blank } from "./calendarKinds";
import { monthDates, shiftMonth, parseDay } from "./calendarDateUtils";
import { entriesFor } from "./calendarEntries";

export default function useCalendarBoard({ initialDate, initialData }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const role = user?.role;
  const [selected, setSelected] = useState(initialDate);
  const [month, setMonth] = useState(initialDate.slice(0, 7));
  const [visible, setVisible] = useState(() => ({ announcement: true, schedule: true, internship: true, todo: true }));
  const [editor, setEditor] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [busy, setBusy] = useState(false);
  const agendaRef = useRef(null);
  const serverSnapshotRef = useRef(null);
  const initialMonth = initialDate.slice(0, 7);
  const monthQuery = useQuery({
    ...calendarMonthOptions(user.id, role, user.department_id, month),
    initialData: month === initialMonth && isCalendarMonth(initialData)
      ? initialData
      : undefined,
  });
  const data = monthQuery.data ?? blank;
  const loading = monthQuery.isFetching;

  useEffect(() => {
    if (serverSnapshotRef.current === initialData) return;
    serverSnapshotRef.current = initialData;
    if (isCalendarMonth(initialData)) {
      queryClient.setQueryData(
        calendarKeys.month(user.id, role, user.department_id, initialMonth),
        initialData,
      );
    }
  }, [initialData, initialMonth, queryClient, role, user.department_id, user.id]);

  useEffect(() => {
    if (monthQuery.error && monthQuery.data) toast.error(monthQuery.error.message);
  }, [monthQuery.error, monthQuery.data]);

  useEffect(() => {
    const refreshForCalendarNotification = (notification) => {
      if (notification?.type === "calendar_schedule" || notification?.type === "announcement") {
        void queryClient.invalidateQueries({ queryKey: calendarKeys.all(user.id) });
      }
    };
    socket.on("new_notification", refreshForCalendarNotification);
    return () => socket.off("new_notification", refreshForCalendarNotification);
  }, [queryClient, user.id]);

  function moveMonth(delta) {
    const next = shiftMonth(month, delta);
    setMonth(next);
    setSelected(`${next}-01`);
  }

  function pickDay(day, scrollToAgenda = false) {
    setSelected(day);
    if (day.slice(0, 7) !== month) {
      setMonth(day.slice(0, 7));
    }
    if (scrollToAgenda) {
      requestAnimationFrame(() => {
        agendaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  const dates = useMemo(() => monthDates(month), [month]);
  const visibleKinds = useMemo(() => new Set(kinds
    .filter((kind) => role === "student" || (kind.id !== "todo" && kind.id !== "internship"))
    .filter((kind) => role !== "employer" || kind.id !== "announcement")
    .filter((kind) => visible[kind.id])
    .map((kind) => kind.id)), [role, visible]);
  const entries = useMemo(() => entriesFor(data, selected).filter((entry) => visibleKinds.has(entry.kind)), [data, selected, visibleKinds]);
  const marked = useMemo(() => dates.filter((day) => entriesFor(data, day).some((entry) => visibleKinds.has(entry.kind))).map(parseDay), [dates, data, visibleKinds]);
  const canAddTodo = role === "student" && data.internship?.date_started <= selected && data.internship?.date_ended >= selected;
  const canSchedule = role === "department_head" || role === "admin";
  const showManual = canSchedule || (role === "student" && Boolean(data.internship));
  const activeKinds = kinds.filter((kind) => kind.id !== "todo" || role === "student")
    .filter((kind) => kind.id !== "internship" || role === "student")
    .filter((kind) => role !== "employer" || kind.id !== "announcement");

  async function mutate(action, successMessage) {
    setBusy(true);
    try {
      const result = await action();
      if (result.error || !result.success) {
        toast.error(result.error || "Couldn't save your changes.");
        return false;
      }
      toast.success(successMessage);
      setEditor(null);
      await queryClient.invalidateQueries({ queryKey: calendarKeys.all(user.id) });
      return true;
    } finally {
      setBusy(false);
    }
  }

  async function saveEditor(event) {
    event.preventDefault();
    if (busy) return;
    const fields = new FormData(event.currentTarget);
    if (editor.kind === "todo") {
      const input = { title: String(fields.get("title") || "").trim(), date: selected };
      await mutate(() => editor.item ? updateCalendarTodo(editor.item.id, { title: input.title }) : createCalendarTodo(input), editor.item ? "To-do updated." : "To-do added.");
      return;
    }
    const input = {
      title: String(fields.get("title") || "").trim(),
      description: String(fields.get("description") || "").trim(),
      starts_on: String(fields.get("starts_on") || ""),
      ends_on: String(fields.get("ends_on") || ""),
    };
    await mutate(() => editor.item ? updateCalendarSchedule(editor.item.id, input) : createCalendarSchedule(input), editor.item ? "Schedule updated. Students were notified." : "Schedule published. Students were notified.");
  }

  async function confirmRemoval() {
    if (busy || !deletingEntry) return;
    const entry = deletingEntry;
    const removed = await mutate(() => entry.kind === "todo" ? deleteCalendarTodo(entry.source.id) : deleteCalendarSchedule(entry.source.id), "Removed from calendar.");
    if (removed) setDeletingEntry(null);
  }
  return {
    monthQuery,
    headerProps: { role, showManual, canSchedule, canAddTodo, setEditor },
    monthProps: {
      month, moveMonth, pickDay, activeKinds, visible, setVisible,
      loading, dates, data, selected, visibleKinds,
    },
    agendaProps: {
      agendaRef, selected, canAddTodo, setEditor, monthQuery, entries,
      canSchedule, role, user, busy, mutate, setDeletingEntry,
    },
    overviewProps: {
      selected, month, setMonth, setSelected, pickDay, marked, data, activeKinds,
    },
    editorProps: { editor, setEditor, busy, saveEditor, selected, role },
    confirmationProps: {
      open: Boolean(deletingEntry),
      onOpenChange: (open) => { if (!open) setDeletingEntry(null); },
      title: `Delete ${deletingEntry?.kind === "todo" ? "to-do" : "schedule"}?`,
      description: deletingEntry
        ? `The selected ${deletingEntry.kind === "todo" ? "to-do" : "schedule"} will be deleted.`
        : "",
      confirmLabel: "Delete",
      pending: busy,
      onConfirm: () => void confirmRemoval(),
    },
  };
}
