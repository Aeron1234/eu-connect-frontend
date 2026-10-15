"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Check, ClipboardList, Megaphone, Plus, Trash2, Pencil, BriefcaseBusiness } from "lucide-react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorUI from "@/components/ui/ErrorUI";
import Modal from "@/components/ui/Modal";
import ManualDialog from "@/components/ui/ManualDialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ModalForm from "@/components/ui/ModalForm";
import { useUser } from "@/contexts/UserContext";
import { socket } from "@/components/ui/SocketProvider";
import {
  calendarKeys,
  calendarMonthOptions,
  isCalendarMonth,
} from "@/lib/cache/calendar-queries";
import {
  createCalendarTodo, updateCalendarTodo, deleteCalendarTodo,
  createCalendarSchedule, updateCalendarSchedule, deleteCalendarSchedule,
} from "@/lib/server-actions/calendar-actions";

const kinds = [
  { id: "announcement", label: "Announcements", dot: "bg-primary", chip: "border-primary/25 bg-primary/10 text-primary-emphasis", icon: Megaphone },
  { id: "schedule", label: "Schedules", dot: "bg-emerald-500", chip: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", icon: CalendarDays },
  { id: "internship", label: "Internship", dot: "bg-sky-500", chip: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300", icon: BriefcaseBusiness },
  { id: "todo", label: "My to-dos", dot: "bg-amber-500", chip: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300", icon: ClipboardList },
];
const blank = { announcements: [], schedules: [], internship: null, todos: [] };
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseDay(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}
function dayKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function manilaTodayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}
function monthDates(month) {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(y, m - 1, 1, 12);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  const last = new Date(y, m, 0, 12);
  const count = Math.ceil((last.getDate() + first.getDay()) / 7) * 7;
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return dayKey(date);
  });
}
function shiftMonth(month, delta) {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(y, m - 1 + delta, 1, 12);
  return dayKey(date).slice(0, 7);
}
function entriesFor(data, day) {
  const result = [];
  for (const item of data.announcements ?? []) {
    if (item.event_date === day) result.push({ kind: "announcement", key: `a-${item.id}`, title: item.title, detail: item.content, href: `/announcements?announcement=${encodeURIComponent(item.id)}`, subtitle: item.category });
  }
  for (const item of data.schedules ?? []) {
    if (item.starts_on <= day && item.ends_on >= day) result.push({ kind: "schedule", key: `s-${item.id}`, title: item.title, detail: item.description, subtitle: item.department_id == null ? "School-wide" : "Department", source: item });
  }
  const internship = data.internship;
  if (internship?.date_started <= day && internship?.date_ended >= day) {
    result.push({ kind: "internship", key: "internship", title: internship.company_name || "Ongoing internship", subtitle: day === internship.date_started ? "First day" : day === internship.date_ended ? "Last day" : "Internship day", href: "/student/internship-record" });
  }
  for (const item of data.todos ?? []) {
    if (item.todo_date === day) result.push({ kind: "todo", key: `t-${item.id}`, title: item.title, done: !!item.is_done, source: item });
  }
  return result;
}

function TodoPreview({ title, done }) {
  const previewRef = useRef(null);
  const [isClipped, setIsClipped] = useState(false);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    const measure = () => setIsClipped(preview.scrollHeight > preview.clientHeight + 1);
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(preview);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [title]);

  return (
    <div className="min-w-0 flex-1">
      <span ref={previewRef} className={`line-clamp-1 min-w-0 break-words text-[11px] font-medium sm:line-clamp-2 sm:text-sm sm:font-semibold ${done ? "line-through opacity-65" : ""}`}>{title}</span>
      {isClipped && (
        <Modal
          title="To-do"
          trigger={<span>See more &rarr;</span>}
          triggerStyles="mt-1 text-left text-xs font-semibold text-primary-emphasis hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">{title}</p>
        </Modal>
      )}
    </div>
  );
}

function CalendarBoard({ initialDate, initialData }) {
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
    .filter((kind) => visible[kind.id])
    .map((kind) => kind.id)), [role, visible]);
  const entries = useMemo(() => entriesFor(data, selected).filter((entry) => visibleKinds.has(entry.kind)), [data, selected, visibleKinds]);
  const marked = useMemo(() => dates.filter((day) => entriesFor(data, day).some((entry) => visibleKinds.has(entry.kind))).map(parseDay), [dates, data, visibleKinds]);
  const canAddTodo = role === "student" && data.internship?.date_started <= selected && data.internship?.date_ended >= selected;
  const canSchedule = role === "department_head" || role === "admin";
  const showManual = canSchedule || (role === "student" && Boolean(data.internship));
  const activeKinds = kinds.filter((kind) => kind.id !== "todo" || role === "student").filter((kind) => kind.id !== "internship" || role === "student");

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

  if (monthQuery.isError && !monthQuery.data) {
    return <ErrorUI error={monthQuery.error} reset={() => void monthQuery.refetch()} logError={false} />;
  }

  return (
    <div className="mx-auto w-full max-w-[1680px] p-3 pb-12 sm:p-6 lg:p-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl"><CalendarDays className="size-6 text-primary-emphasis" /> Calendar</h1>
            {showManual && (
              <ManualDialog title="How to use the calendar">
                <div className="space-y-4 text-sm leading-relaxed text-foreground">
                  <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-primary-emphasis">
                    <li>Use the arrows to change months or <strong>Today</strong> to return to the current date. Select a day to see its announcements, schedules, and other details in the day agenda below.</li>
                    <li>Use the checkboxes above the calendar to show or hide each type of item. Colored dots mark days with items; on larger screens, you can see a preview in each day.</li>
                    {role === "student" ? (
                      <>
                        <li>Choose a day within your ongoing internship dates, then select <strong>Add to-do</strong>. Enter a task title and save it. Your to-dos are private to you.</li>
                        <li>In the day agenda, use the checkmark to complete or reopen a to-do. Use the pencil to edit it, or the trash icon to delete it after confirmation.</li>
                      </>
                    ) : (
                      <>
                        <li>Select the date, then choose <strong>Add schedule</strong>. Enter a title, optional details, and the start and end dates. Select <strong>Publish schedule</strong> to save it and notify students.</li>
                        <li>Open a scheduled day in the agenda to edit or delete a schedule you created. {role === "admin" ? "As an admin, you can also manage other schedules." : "Only your own schedules can be changed."}</li>
                      </>
                    )}
                  </ol>
                </div>
              </ManualDialog>
            )}
          </div>
          <p className="mt-1 text-sm text-foreground-soft">{role === "employer" ? "View school-wide announcements and schedules." : "Internship dates, announcements, schedules, and your daily plans."}</p>
        </div>
        {(canSchedule || canAddTodo) && (
          <button type="button" onClick={() => setEditor({ kind: canSchedule ? "schedule" : "todo", item: null })} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto">
            <Plus className="size-4" /> {canSchedule ? "Add schedule" : "Add to-do"}
          </button>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_270px]">
        <div className="min-w-0 space-y-4">
          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm" aria-label="Monthly calendar">
            <div className="flex flex-col items-center justify-center gap-3 border-b border-border p-3 sm:flex-row sm:justify-between sm:p-5">
              <div className="text-center sm:text-left">
                <h2 className="text-lg font-bold text-foreground sm:text-xl">{format(parseDay(`${month}-01`), "MMMM yyyy")}</h2>
                <p className="text-xs text-foreground-subtle">Select a day to see its details</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => moveMonth(-1)} aria-label="Previous month" className="grid size-9 place-items-center rounded-lg border border-border text-foreground hover:bg-muted"><ChevronLeft className="size-4" /></button>
                <button type="button" onClick={() => pickDay(manilaTodayKey())} className="h-9 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-muted">Today</button>
                <button type="button" onClick={() => moveMonth(1)} aria-label="Next month" className="grid size-9 place-items-center rounded-lg border border-border text-foreground hover:bg-muted"><ChevronRight className="size-4" /></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 border-b border-border px-3 py-3 sm:px-5">
              {activeKinds.map((kind) => <label key={kind.id} className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-foreground-soft"><input type="checkbox" checked={visible[kind.id]} onChange={(event) => setVisible((old) => ({ ...old, [kind.id]: event.target.checked }))} className="accent-primary" /><span className={`size-2 rounded-full ${kind.dot}`} />{kind.label}</label>)}
            </div>
            {loading && <div className="h-1 w-full animate-pulse bg-primary" role="status" aria-label="Loading calendar" />}
            <div className="grid grid-cols-7 border-b border-border bg-muted/35 text-center text-[10px] font-semibold uppercase tracking-wide text-foreground-subtle sm:text-xs">
              {weekdays.map((day) => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-px bg-border">
              {dates.map((day) => {
                const inMonth = day.slice(0, 7) === month;
                const items = entriesFor(data, day).filter((entry) => visibleKinds.has(entry.kind));
                const isSelected = selected === day;
                return (
                  <button key={day} type="button" onClick={() => pickDay(day, items.length > 0)} aria-label={`${format(parseDay(day), "EEEE, MMMM d, yyyy")}, ${items.length} items`} aria-pressed={isSelected} className={`min-w-0 min-h-12 p-1 text-left align-top transition-colors focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-primary sm:min-h-20 sm:p-2 md:min-h-28 ${inMonth ? "bg-card" : "bg-muted/35 text-foreground-faint"} ${isSelected ? "ring-2 ring-inset ring-primary" : "hover:bg-muted/50"}`}>
                    <span className={`mb-0.5 inline-grid size-5 place-items-center rounded-full text-[11px] font-semibold sm:mb-1 sm:size-6 sm:text-xs ${day === manilaTodayKey() ? "bg-primary text-white" : ""}`}>{parseDay(day).getDate()}</span>
                    <span className="flex flex-wrap gap-0.5 md:hidden">{items.slice(0, 4).map((entry) => <span key={entry.key} className={`size-1.5 rounded-full ${kinds.find((kind) => kind.id === entry.kind)?.dot}`} />)}</span>
                    <span className="hidden space-y-1 md:block">{items.slice(0, 2).map((entry) => <span key={entry.key} className={`block truncate rounded border px-1.5 py-0.5 text-[10px] font-medium ${kinds.find((kind) => kind.id === entry.kind)?.chip}`}>{entry.title}</span>)}{items.length > 2 && <span className="block text-[10px] font-medium text-foreground-subtle">+{items.length - 2} more</span>}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section ref={agendaRef} className="scroll-mt-20 rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-5" aria-label="Selected day agenda">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary-emphasis">Day agenda</p><h2 className="text-lg font-bold text-foreground">{format(parseDay(selected), "EEEE, MMMM d, yyyy")}</h2></div>
              {canAddTodo && <button type="button" onClick={() => setEditor({ kind: "todo", item: null })} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-emphasis hover:underline"><Plus className="size-4" /> Add to-do</button>}
            </div>
            {monthQuery.isPending ? <div className="space-y-2" role="status" aria-label="Loading this day"><Skeleton className="h-16 w-full rounded-xl" /><Skeleton className="h-16 w-full rounded-xl" /></div> : entries.length === 0 ? <p className="rounded-xl bg-muted/45 p-4 text-sm text-foreground-soft">Nothing scheduled for this day.</p> : <div className="space-y-2">{entries.map((entry) => {
              const meta = kinds.find((kind) => kind.id === entry.kind);
              const Icon = meta.icon;
              const editable = canSchedule && entry.kind === "schedule" && (role === "admin" || String(entry.source.created_by) === String(user.id));
              return <div key={entry.key} className={`flex min-w-0 items-start gap-2 rounded-xl border p-2.5 text-xs sm:gap-3 sm:p-3 sm:text-sm ${meta.chip}`}>
                <Icon className="mt-0.5 size-4 shrink-0" />
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-1 sm:gap-2">{entry.kind === "todo" ? <TodoPreview title={entry.title} done={entry.done} /> : <span className={`min-w-0 break-words font-semibold ${entry.kind === "announcement" ? "line-clamp-2" : ""}`}>{entry.title}</span>}<span className="text-[10px] opacity-75 sm:text-[11px]">{meta.label}</span></div>{entry.subtitle && <p className="mt-0.5 text-[11px] opacity-80 sm:text-xs">{entry.subtitle}</p>}{entry.detail && <p className={`mt-1 break-words text-xs opacity-85 sm:text-sm ${entry.kind === "announcement" ? "line-clamp-3 whitespace-normal" : "whitespace-pre-wrap"}`}>{entry.detail}</p>}{entry.href && <Link href={entry.href} className="mt-1 inline-block text-xs font-semibold underline">View details</Link>}</div>
                {entry.kind === "todo" && <button type="button" disabled={busy} onClick={() => void mutate(() => updateCalendarTodo(entry.source.id, { is_done: !entry.done }), entry.done ? "Marked as pending." : "To-do completed.")} aria-label={entry.done ? "Mark to-do pending" : "Complete to-do"} className="rounded-md border border-current/25 p-1"><Check className="size-4" /></button>}
                {(editable || entry.kind === "todo") && <div className="flex shrink-0 gap-1"><button type="button" onClick={() => setEditor({ kind: entry.kind, item: entry.source })} aria-label={`Edit ${entry.title}`} className="rounded-md p-1 hover:bg-black/10"><Pencil className="size-4" /></button><button type="button" disabled={busy} onClick={() => setDeletingEntry(entry)} aria-label={`Delete ${entry.title}`} className="rounded-md p-1 hover:bg-black/10"><Trash2 className="size-4" /></button></div>}
              </div>;
            })}</div>}
          </section>
        </div>

        <aside className="hidden space-y-4 xl:block" aria-label="Calendar overview">
          <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
            <Calendar mode="single" selected={parseDay(selected)} month={parseDay(`${month}-01`)} onMonthChange={(date) => { const next = dayKey(date).slice(0, 7); setMonth(next); setSelected(`${next}-01`); }} onSelect={(date) => { if (date) pickDay(dayKey(date)); }} modifiers={{ marked }} modifiersClassNames={{ marked: "border-b-2 border-primary" }} className="w-full bg-transparent p-1 [--cell-size:2rem]" classNames={{ root: "w-full", weekday: "text-foreground-subtle flex-1 text-[11px]", day: "relative w-full aspect-square text-center" }} />
          </div>
          {data.internship && <div className="rounded-2xl border border-sky-500/25 bg-sky-500/10 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">Ongoing internship</p><h3 className="mt-1 font-bold text-foreground">{data.internship.company_name}</h3><p className="mt-2 text-xs text-foreground-soft">{data.internship.date_started} – {data.internship.date_ended}</p></div>}
          <div className="rounded-2xl border border-border bg-card p-4"><h3 className="font-bold text-foreground">Your calendars</h3><div className="mt-3 space-y-2">{activeKinds.map((kind) => <div key={kind.id} className="flex items-center gap-2 text-sm text-foreground-soft"><span className={`size-2 rounded-full ${kind.dot}`} />{kind.label}</div>)}</div></div>
        </aside>
      </div>

      <ConfirmDialog
        open={Boolean(deletingEntry)}
        onOpenChange={(open) => { if (!open) setDeletingEntry(null); }}
        title={`Delete ${deletingEntry?.kind === "todo" ? "to-do" : "schedule"}?`}
        description={deletingEntry ? `The selected ${deletingEntry.kind === "todo" ? "to-do" : "schedule"} will be deleted.` : ""}
        confirmLabel="Delete"
        pending={busy}
        onConfirm={() => void confirmRemoval()}
      />

      <Dialog open={!!editor} onOpenChange={(open) => { if (!open && !busy) setEditor(null); }}>
        <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-auto p-4 sm:max-w-lg sm:p-6" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>{editor?.item ? "Edit" : "Add"} {editor?.kind === "todo" ? "to-do" : "schedule"}</DialogTitle></DialogHeader>
          {editor && <ModalForm.Root onSubmit={saveEditor}>
            <ModalForm.Section title={editor.kind === "todo" ? "Your daily task" : "Schedule details"}>
              <ModalForm.Field label="Title"><ModalForm.Input name="title" maxLength={160} required defaultValue={editor.item?.title || ""} autoFocus /></ModalForm.Field>
              {editor.kind === "schedule" && <><ModalForm.Field label="Details (optional)"><ModalForm.Textarea name="description" maxLength={2000} defaultValue={editor.item?.description || ""} /></ModalForm.Field><ModalForm.Row><ModalForm.Field label="Start date"><ModalForm.Input type="date" name="starts_on" required defaultValue={editor.item?.starts_on || selected} /></ModalForm.Field><ModalForm.Field label="End date"><ModalForm.Input type="date" name="ends_on" required defaultValue={editor.item?.ends_on || selected} /></ModalForm.Field></ModalForm.Row><p className="text-xs text-foreground-subtle">{role === "admin" && editor.item?.department_id == null ? "School-wide: all students will be notified." : "Students in this department will be notified."}</p></>}
              {editor.kind === "todo" && <p className="text-xs text-foreground-subtle">Private to you · {format(parseDay(selected), "MMMM d, yyyy")}</p>}
            </ModalForm.Section>
            <ModalForm.Actions isPending={busy} closeOnSubmit={false} submitLabel={editor.item ? "Save changes" : editor.kind === "todo" ? "Add to-do" : "Publish schedule"} />
          </ModalForm.Root>}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CalendarBoard;
