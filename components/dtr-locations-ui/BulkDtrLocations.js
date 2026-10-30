"use client";

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, RefreshCw, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { socket } from '@/components/ui/SocketProvider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import DropdownFilter from '@/components/ui/DropdownFilter';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ErrorUI from '@/components/ui/ErrorUI';
import HelpManual from '@/components/help-ui/HelpManual';
import PageTitle from '@/components/ui/PageTitle';
import EditableMapSkeleton from '@/components/skeletons/EditableMapSkeleton';
import { getBulkDtrStudents, getBulkDtrPins, assignBulkDtrLocations } from '@/lib/server-actions/bulk-dtr-actions';
import { MAX_DTR_SELECTION, selectDtrPage, remainingDtrSelection, validDtrDraft } from '@/lib/bulk-dtr-selection.mjs';
import { showActionError } from '@/lib/toast-and-action.mjs';
import { StudentTableSkeleton } from './BulkDtrSkeleton';
import StudentAvatar from './StudentAvatar';

const BulkDtrMap = dynamic(() => import('./BulkDtrMap'), { ssr: false, loading: () => <EditableMapSkeleton /> });
const fieldClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm';
async function checkedRead(action, filters) {
  const result = await action(filters);
  if (!result.success) throw Object.assign(new Error(result.error), { status: result.status });
  return result;
}
function FilterSelect({ label, value, onChange, options, disabled }) {
  return <DropdownFilter value={value === 'all' ? '' : value} onValueChange={next => onChange(next || 'all')} disabled={disabled} aria-label={label} placeholder={label} className="w-full bg-card p-2 sm:w-auto" options={[{ value: '', label }, ...options.map(option => ({ value: String(option.id), label: option.code || option.short_name || option.name || option.course_name }))]} />;
}

export default function BulkDtrLocations() {
  const { user } = useUser();
  // Remount selection state when the authenticated identity changes.
  return <AssignmentPage key={`${user.id}:${user.role}`} user={user} />;
}
function AssignmentPage({ user }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState(''), [searchTerm, setSearchTerm] = useState('');
  const [department, setDepartment] = useState('all'), [course, setCourse] = useState('all'), [page, setPage] = useState(1);
  const [selection, setSelection] = useState(new Map());
  const [draft, setDraft] = useState({ lat: '', lon: '', address: '', label: '' }), [radius, setRadius] = useState(150);
  const [confirmation, setConfirmation] = useState(null), [saving, setSaving] = useState(false), [outcome, setOutcome] = useState(null);
  const submitting = useRef(false);
  useEffect(() => {
    if (search.trim() === searchTerm) return;
    const timeout = setTimeout(() => { setSearchTerm(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(timeout);
  }, [search, searchTerm]);
  const filters = { search: searchTerm, ...(department !== 'all' && user.role === 'admin' ? { departmentId: department } : {}), ...(course !== 'all' && user.role !== 'employer' ? { courseId: course } : {}) };
  const rootKey = ['bulk-dtr-locations', String(user.id)];
  const students = useQuery({ queryKey: [...rootKey, 'students', filters, page], queryFn: () => checkedRead(getBulkDtrStudents, { ...filters, page: String(page) }), placeholderData: previous => previous, staleTime: 0, retry: false });
  const pins = useQuery({ queryKey: [...rootKey, 'pins', filters], queryFn: () => checkedRead(getBulkDtrPins, filters), staleTime: 0, retry: false });
  useEffect(() => {
    const update = () => { void queryClient.invalidateQueries({ queryKey: ['bulk-dtr-locations', String(user.id)] }); };
    socket.on('dtr_locations_changed', update);
    return () => socket.off('dtr_locations_changed', update);
  }, [queryClient, user.id]);
  const denied = [students.error, pins.error].find(error => [401, 403].includes(error?.status));
  const rows = students.data?.students || [];
  const selected = [...selection.values()];
  const checkedCount = rows.filter(row => selection.has(row.internship_id)).length;
  const filteredPending = search.trim() !== searchTerm || students.isFetching;
  function toggle(rowsToToggle, checked) {
    const next = selectDtrPage(selection, rowsToToggle, checked);
    if (!next) return showActionError(toast, `Select up to ${MAX_DTR_SELECTION} students per assignment.`);
    setSelection(next); setOutcome(null);
  }
  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: rootKey });
  }
  function review(event) {
    event.preventDefault();
    if (!selection.size || !validDtrDraft(draft, radius)) return showActionError(toast, 'Select students, a map location and a valid radius.');
    // Capture exactly the reviewed IDs/location. Changes to filters, map lookup
    // results or selection cannot silently alter an open confirmation.
    setConfirmation({ students: selected, body: { internshipIds: selected.map(s => s.internship_id), ...draft, radius_meter: Number(radius) }, replacementCount: selected.filter(s => s.location).length });
  }
  async function save() {
    if (submitting.current || !confirmation) return;
    submitting.current = true; setSaving(true);
    const toastId = toast.loading(`Assigning DTR location to ${confirmation.students.length} students…`);
    try {
      const result = await assignBulkDtrLocations(confirmation.body);
      if (!result.success) {
        showActionError(toast, result.error || 'Could not confirm the assignments.', { id: toastId });
        setOutcome({ error: result.error || 'Could not confirm the assignments. Refresh before retrying.', results: confirmation.students.map(student => ({ internship_id: student.internship_id, name: student.name, status: 'failed', reason: 'Assignment not confirmed. Refresh before retrying.' })) });
        await refresh(); return;
      }
      setSelection(previous => remainingDtrSelection(previous, result.results));
      const names = new Map(confirmation.students.map(s => [s.internship_id, s.name]));
      setOutcome({ ...result, results: result.results.map(item => ({ ...item, name: names.get(item.internship_id) || 'Selected student' })) });
      setConfirmation(null);
      if (!result.summary.failed) setDraft({ lat: '', lon: '', address: '', label: '' });
      if (result.summary.failed) showActionError(toast, result.message, { id: toastId });
      else toast.success(result.message, { id: toastId });
      await Promise.all([
        refresh(),
        queryClient.invalidateQueries({ queryKey: ['user-profile', String(user.id)] }),
        queryClient.invalidateQueries({ queryKey: ['internship-records', String(user.id)] }),
        queryClient.invalidateQueries({ queryKey: ['notifications', String(user.id)] }),
      ]);
    } catch {
      const error = 'Could not confirm the assignments. Refresh the table and map before retrying.';
      showActionError(toast, error, { id: toastId }); setOutcome({ error, results: confirmation.students.map(student => ({ internship_id: student.internship_id, name: student.name, status: 'failed', reason: 'Assignment not confirmed. Refresh before retrying.' })) });
    } finally { submitting.current = false; setSaving(false); }
  }
  if (denied) return <ErrorUI error={denied} reset={() => { setSelection(new Map()); void refresh(); }} compact />;
  const scopeText = user.role === 'admin' ? 'All ongoing internships. Filter by department and course.' : user.role === 'department_head' ? 'Ongoing interns in your department. Filter by course.' : 'Your supervised interns with ongoing internships.';
  return <div className="space-y-5 p-4 sm:p-6 lg:p-8">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><PageTitle Icon={MapPin} title="DTR Location Assignment" description={scopeText} titleAction={<HelpManual guideId="bulk-dtr-locations" />} /><Button variant="outline" className="self-start sm:self-auto" onClick={refresh} disabled={saving || students.isFetching || pins.isFetching}><RefreshCw className="size-4" />Refresh</Button></header>
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <label className="relative min-w-0 sm:max-w-sm sm:flex-1"><Search className="absolute left-3 top-2.5 size-4 text-foreground-soft" /><span className="sr-only">Search students by name</span><input value={search} maxLength={100} onChange={event => setSearch(event.target.value)} placeholder="Search student name…" className={`${fieldClass} pl-9`} disabled={saving} /></label>
      {user.role === 'admin' && <FilterSelect label="Departments" value={department} disabled={saving} options={students.data?.departments || []} onChange={value => { setDepartment(value); setCourse('all'); setPage(1); }} />}
      {user.role !== 'employer' && <FilterSelect label="Courses" value={course} disabled={saving || students.isFetching} options={students.data?.courses || []} onChange={value => { setCourse(value); setPage(1); }} />}
    </div>
    {outcome && <div role="status" className="rounded-xl border border-border bg-card p-4 text-sm"><p className="font-semibold">{outcome.error || outcome.message}</p>{outcome.results?.some(item => item.status === 'failed') && <ul className="mt-2 list-disc space-y-1 pl-5">{outcome.results.filter(item => item.status === 'failed').map(item => <li key={item.internship_id}>{item.name}: {item.reason}</li>)}</ul>}<p className="mt-1 text-foreground-soft">{outcome.error ? 'No success is confirmed. Refresh before trying again.' : 'Students not assigned remain selected. Successful changes notify students; staff changes also notify their supervisors.'}</p></div>}
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card" aria-label="DTR location map and assignment">
        <div className="border-b border-border p-4"><h2 className="font-semibold">Choose a DTR location</h2><p className="mt-1 text-xs text-foreground-soft">Search or click the map. Blue pins group custom and company-default DTR locations in your current filters; the maroon pin previews your selection.</p></div>
        {pins.isPending ? <div className="h-[360px] sm:h-[460px]"><EditableMapSkeleton /></div> : pins.isError && !pins.data ? <ErrorUI error={pins.error} reset={pins.refetch} compact /> : <>
          {pins.isError && <p role="alert" className="p-3 text-sm text-destructive">Could not refresh map pins. Showing the last saved view. <button className="underline" onClick={() => pins.refetch()}>Retry</button></p>}
          <div className="relative h-[360px] sm:h-[460px]" aria-busy={pins.isFetching}>
            <BulkDtrMap draft={draft} setDraft={setDraft} radius={radius} setRadius={setRadius} locations={pins.data?.locations || []} />
            {pins.isFetching && <span role="status" className="absolute bottom-2 left-2 z-[500] rounded bg-background px-2 py-1 text-xs">Refreshing pins…</span>}
            {saving && <div className="absolute inset-0 z-[1200] bg-background/30" aria-label="Saving assignments" />}
          </div>
          {!pins.data?.locations.length && <p className="px-4 pt-3 text-xs text-foreground-soft">No valid DTR locations in these filters.</p>}
        </>}
        <form onSubmit={review} className="space-y-3 p-4">
          <div><label htmlFor="dtr-address" className="text-xs font-medium">Location / address</label><input id="dtr-address" className={fieldClass} maxLength={255} value={draft.address || ''} disabled={saving} onChange={event => setDraft(previous => ({ ...previous, address: event.target.value }))} placeholder="Choose a pin, then confirm or shorten the address" /><p className="mt-1 text-xs text-foreground-soft">{draft.lat !== '' && draft.lon !== '' ? `${Number(draft.lat).toFixed(6)}, ${Number(draft.lon).toFixed(6)}` : 'No location selected.'}</p></div>
          <div className="grid gap-3 sm:grid-cols-[140px_1fr]"><label className="text-xs font-medium" htmlFor="dtr-radius">Allowed radius (m)<input id="dtr-radius" type="number" min={20} max={2000} step={1} required className={fieldClass} value={radius} disabled={saving} onChange={event => setRadius(event.target.value)} /></label><label className="text-xs font-medium" htmlFor="dtr-label">Location note (optional)<input id="dtr-label" className={fieldClass} maxLength={255} value={draft.label} disabled={saving} onChange={event => setDraft(previous => ({ ...previous, label: event.target.value }))} placeholder="e.g. Main entrance" /></label></div>
          <p className="text-xs text-foreground-soft">Attendance uses this pin and a 20–2,000 m radius for both clock-in and clock-out. Default: 150 m.</p>
          {selected.some(student => student.location) && <p className="text-sm text-primary-emphasis">Saving replaces existing custom assignments for {selected.filter(student => student.location).length} selected students.</p>}
          {!validDtrDraft(draft, radius) && draft.lat !== '' && <p className="text-xs text-destructive">Use valid coordinates, a whole-number radius from 20 to 2,000 m, and address/note text of at most 255 characters.</p>}
          <Button type="submit" className="w-full" disabled={saving || !selected.length || !validDtrDraft(draft, radius)}>Review assignment · {selected.length} selected</Button>
        </form>
      </section>
      <div className="min-w-0 space-y-4">
        <section className="overflow-hidden rounded-xl border border-border bg-card" aria-label="Student selection">
          <div className="flex items-center justify-between gap-2 border-b border-border p-4"><h2 className="font-semibold">Selected students <span className="text-primary-emphasis">({selected.length})</span></h2><Button variant="ghost" size="sm" disabled={!selected.length || saving} onClick={() => setSelection(new Map())}>Clear all</Button></div>
          {selected.length ? <ul className="max-h-44 space-y-2 overflow-y-auto p-3">{selected.map(student => <li key={student.internship_id} className="flex items-center gap-2"><StudentAvatar student={student} /><span className="min-w-0 flex-1 truncate text-sm">{student.name}</span><Button variant="ghost" size="icon" disabled={saving} aria-label={`Remove ${student.name} from selection`} onClick={() => toggle([student], false)}><X className="size-4" /></Button></li>)}</ul> : <p className="p-4 text-sm text-foreground-soft">Select one or more students below. Selections stay when you search, filter or change pages.</p>}
          <p className="px-4 pb-3 text-xs text-foreground-soft">Up to {MAX_DTR_SELECTION} internship assignments per save. Selection includes students hidden by current filters.</p>
        </section>
        <section className="overflow-hidden rounded-xl border border-border bg-card" aria-label="Ongoing internship students">
          {students.isError && <ErrorUI error={students.error} reset={students.refetch} compact />}
          {filteredPending || students.isPending ? <StudentTableSkeleton /> : <>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border bg-muted/40"><tr><th className="p-3"><Checkbox aria-label="Select all students on this page" disabled={!rows.length || saving || students.isError} checked={checkedCount === rows.length && rows.length > 0 ? true : checkedCount > 0 ? 'indeterminate' : false} onCheckedChange={checked => toggle(rows, checked === true)} /></th><th className="p-3">Student</th><th className="p-3">DTR location</th></tr></thead><tbody>{rows.map(student => <tr key={student.internship_id} className="border-b border-border last:border-0"><td className="p-3 align-top"><Checkbox checked={selection.has(student.internship_id)} disabled={saving || students.isError} aria-label={`Select ${student.name}`} onCheckedChange={checked => toggle([student], checked === true)} /></td><td className="p-3 align-top"><div className="flex min-w-40 items-center gap-2"><StudentAvatar student={student} /><div><p className="font-semibold">{student.name}</p><p className="text-xs text-foreground-soft">{student.course_code || student.course_name || 'No course'}{user.role !== 'department_head' && student.department_code ? ` · ${student.department_code}` : ''}</p><p className="text-xs text-foreground-soft">{student.company_name}</p></div></div></td><td className="max-w-56 break-words p-3 align-top text-xs">{student.location ? <><span className="font-medium">{student.location.address || `${student.location.lat}, ${student.location.lon}`}</span><p>{student.location.radius_meters} m · Custom</p>{student.location.label && <p>{student.location.label}</p>}</> : student.company_location ? <><span>{student.company_location.address || `${student.company_location.lat}, ${student.company_location.lon}`}</span><p>150 m · Company default</p></> : 'No location assigned'}</td></tr>)}</tbody></table></div>
            {!rows.length && !students.isError && <p className="p-6 text-center text-sm text-foreground-soft">No accessible ongoing interns match these filters.</p>}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border p-3 text-xs"><span>{students.data?.pagination.total || 0} internship records · Select all applies to this page only.</span><div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={saving || (students.data?.pagination.page || 1) <= 1} onClick={() => setPage((students.data?.pagination.page || page) - 1)}>Previous</Button><span>Page {students.data?.pagination.page || 1} / {students.data?.pagination.totalPages || 1}</span><Button variant="outline" size="sm" disabled={saving || (students.data?.pagination.page || 1) >= (students.data?.pagination.totalPages || 1)} onClick={() => setPage((students.data?.pagination.page || page) + 1)}>Next</Button></div></div>
          </>}
        </section>
      </div>
    </div>
    <ConfirmDialog open={Boolean(confirmation)} onOpenChange={open => { if (!open) setConfirmation(null); }} title="Assign DTR location?" description={confirmation ? `Assign ${confirmation.students.length} students to ${confirmation.body.address || `${confirmation.body.lat}, ${confirmation.body.lon}`} within ${confirmation.body.radius_meter} m. Existing locations will be replaced. Students will be notified; staff changes also notify assigned supervisors. ${confirmation.replacementCount} selected students currently have a custom location.` : ''} confirmLabel="Assign location" onConfirm={save} pending={saving} />
  </div>;
}
