"use client";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/contexts/UserContext';
import { dutyOptions } from '@/lib/cache/duty-queries';
import { useDutySave } from './AbsenceDetails';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../ui/Modal';
import { Button } from '../ui/button';
import DropdownFilter from '../ui/DropdownFilter';
import { Skeleton } from '../ui/skeleton';
import DtrTable from './DtrTable';
import { AbsenceForm, AbsenceDetails } from './AbsenceDetails';
import HelpManual from '../help-ui/HelpManual';
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const input = 'mt-1 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm';
function shortDate(value) { return value ? new Date(String(value).slice(0, 10) + 'T00:00:00Z').toLocaleDateString('en-US', { timeZone: 'UTC', month: '2-digit', day: '2-digit', year: 'numeric' }) : '-'; }
export function DutyScheduleForm({ today, onSaved }) {
    const [workingDays, setDays] = useState([1, 2, 3, 4, 5]);
    const { pending, save } = useDutySave(onSaved);
    return <form noValidate className="space-y-4" onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); void save({ action: 'schedule', workingDays, ...Object.fromEntries(f) }); }}>
 <p className="text-sm text-muted-foreground">Your supervisor’s schedule takes priority. Changes to an existing student schedule start tomorrow or later. Hours use Philippine time.</p>
 <fieldset><legend className="mb-2 text-sm font-medium">Working days</legend><div className="flex flex-wrap gap-3">{days.map((day, i) => <label key={day} className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={workingDays.includes(i)} disabled={pending} onChange={e => setDays(e.target.checked ? [...workingDays, i] : workingDays.filter(d => d !== i))}/>{day.slice(0, 3)}</label>)}</div></fieldset>
 <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Clock in<input className={input} type="time" name="clockInTime" required defaultValue="08:00"/></label><label className="text-sm">Clock out<input className={input} type="time" name="clockOutTime" required defaultValue="17:00"/></label><label className="text-sm">Effective from<input className={input} type="date" name="effectiveFrom" min={today} required defaultValue={today}/></label><label className="text-sm">Effective until (optional)<input className={input} type="date" name="effectiveUntil" min={today}/></label></div>
 <p className="text-xs text-muted-foreground">For a temporary change, submit a new schedule with an end date, then submit the normal schedule with its next effective date. For holidays or leave, use Report absence / no duty.</p>
 <Button disabled={pending || !workingDays.length} type="submit">{pending ? <Loader2 className="size-4 animate-spin"/> : 'Submit schedule'}</Button></form>;
}
export default function DutySchedulePanel({ staff = false, initialSection='absences' }) {
    const { user } = useUser();
    const [section, setSection] = useState(initialSection), [page, setPage] = useState(1), [search, setSearch] = useState('');
    const [scheduleOpen, setScheduleOpen] = useState(false), [absenceOpen, setAbsenceOpen] = useState(false);
    const query = useQuery(dutyOptions(user?.id, staff ? { section, page: String(page), search } : {}));
    if (query.isPending)
        return <section className="rounded-xl border border-border bg-card p-4" aria-label="Loading duty schedule"><Skeleton className="mb-3 h-5 w-48"/><Skeleton className="h-24 w-full"/></section>;
    if (query.isError)
        return <section role="alert" className="rounded-xl border border-border bg-card p-4 text-sm"><p>{query.error.message}</p><Button variant="outline" className="mt-2" onClick={() => query.refetch()}>Try again</Button></section>;
    const data = query.data;
    const rows = staff ? data.rows : data.reports;
    const totalPages=staff?data.totalPages:Math.max(1,Math.ceil(rows.length/10));
    const displayedRows=staff?rows:rows.slice((page-1)*10,page*10);
    const pending = rows.find(row => row.review_status === 'reason_needed');
    const today = data.now?.slice(0, 10);
    return <section className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
 <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-base font-semibold">{staff ? 'Duty schedules and absence reports' : 'My duty schedule and absences'}<HelpManual guideId={staff ? 'department-duty' : 'student-duty'}/></h2>
 {!staff && <div className="flex flex-wrap gap-2"><Modal open={scheduleOpen} onOpenChange={setScheduleOpen} title="Set weekly duty schedule" trigger={<span>Set / change schedule</span>} triggerStyles="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"><DutyScheduleForm today={data.schedules.some(s => s.source === 'student') ? new Date(Date.parse(today + 'T00:00:00Z') + 86400000).toISOString().slice(0, 10) : today} onSaved={() => setScheduleOpen(false)}/></Modal>
 <Modal open={absenceOpen} onOpenChange={setAbsenceOpen} title="Report absence / no duty" trigger={<span>Report another date</span>} triggerStyles="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"><AbsenceForm date={data.duty?.shift_date || today} onSaved={() => setAbsenceOpen(false)}/></Modal></div>}</div>
 {!staff && <><p className="text-sm text-muted-foreground">{data.duty ? `${data.duty.source === 'employer' ? 'Supervisor' : 'Your fallback'} schedule: ${String(data.duty.clock_in_time).slice(0, 5)}-${String(data.duty.clock_out_time).slice(0, 5)} - ${data.duty.isDuty ? 'Duty day' : 'Rest day'}.` : 'Set your weekly working days and hours before clocking in.'} Clock in opens 30 minutes before start. Overnight duty belongs to its start date.</p>
 {pending && <div className="rounded-md border border-amber-500/40 p-3 text-sm"><p className="mb-2">No attendance recorded for {shortDate(pending.shift_date)}. Please explain.</p><AbsenceDetails key={pending.id} report={pending} prompt/></div>}
 <details><summary className="cursor-pointer text-sm font-medium">Schedule history</summary><ScheduleRows rows={data.schedules}/></details></>}
 {staff && <div className="flex flex-col gap-2 sm:flex-row"><DropdownFilter value={section} options={[{ value: 'absences', label: 'Absence reports' }, { value: 'schedules', label: 'Duty schedules' }]} onValueChange={v => { setSection(v); setPage(1); }} className="w-full sm:w-52"/><input className="h-10 rounded-md border border-input bg-background px-3 text-sm" aria-label="Search student" placeholder="Search student name" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/></div>}
 {staff && section === 'schedules' ? <ScheduleRows rows={rows}/> : <DtrTable dtrs={displayedRows.map(r => ({ ...r, id: `absence-${r.id}`, created_at: r.shift_date, total_hours: 0, status: r.category === 'no_duty' ? 'No duty' : r.category === 'worked' ? 'Attendance correction' : r.category === 'leave' ? 'Leave' : 'absent', absence_report: r, absence_staff: staff }))} showStudent={staff}/>}
 {(staff || totalPages>1) && <nav aria-label="Duty report pages" className="flex items-center justify-end gap-3 text-sm"><Button variant="outline" size="icon" aria-label="Previous page" disabled={page <= 1 || query.isFetching} onClick={() => setPage(p => p - 1)}>{query.isFetching ? <Loader2 className="size-4 animate-spin"/> : <ChevronLeft className="size-4"/>}</Button><span>Page {page} / {totalPages}</span><Button variant="outline" size="icon" aria-label="Next page" disabled={page >= totalPages || query.isFetching} onClick={() => setPage(p => p + 1)}><ChevronRight className="size-4"/></Button></nav>}
 </section>;
}
function ScheduleRows({ rows }) { return <div className="min-w-0 overflow-x-auto"><table className="w-full min-w-[780px] whitespace-nowrap text-left text-sm"><thead><tr className="border-b border-border">{['Student / source', 'Working days', 'Hours', 'Effective from', 'Until'].map(h => <th className="px-3 py-2 font-medium" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-b border-border"><td className="px-3 py-2">{row.student_name || 'Your schedule'} - {row.source}</td><td className="px-3 py-2">{(Array.isArray(row.working_days) ? row.working_days : JSON.parse(row.working_days || '[]')).map(d => days[d]?.slice(0, 3)).join(', ')}</td><td className="px-3 py-2">{row.clock_in_time}-{row.clock_out_time}</td><td className="px-3 py-2">{shortDate(row.effective_from)}</td><td className="px-3 py-2">{shortDate(row.effective_until)}</td></tr>)}{!rows.length && <tr><td className="p-3 text-muted-foreground" colSpan={5}>No schedules found.</td></tr>}</tbody></table></div>; }
