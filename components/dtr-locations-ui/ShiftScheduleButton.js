"use client";
import { useState } from 'react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { updateDtrShiftSchedule } from '@/lib/server-actions/bulk-dtr-actions';

export default function ShiftScheduleButton({ student, onSaved }) {
  const [open, setOpen] = useState(false);
  const [workingDays,setWorkingDays]=useState(student.schedule?.workingDays || [0,1,2,3,4,5,6]);
  const [clockInTime, setClockInTime] = useState(student.schedule?.clockInTime || '08:00');
  const [clockOutTime, setClockOutTime] = useState(student.schedule?.clockOutTime || '17:00');
  const [startDate, setStartDate] = useState(student.schedule?.startDate || '');
  const [endDate, setEndDate] = useState(student.schedule?.endDate || '');
  const [pending, setPending] = useState(false);
  function toggleOpen(next) {
    if (pending) return;
    if (next) {
      setWorkingDays(student.schedule?.workingDays || [0,1,2,3,4,5,6]);
      setClockInTime(student.schedule?.clockInTime || '08:00');
      setClockOutTime(student.schedule?.clockOutTime || '17:00');
      setStartDate(student.schedule?.startDate || '');
      setEndDate(student.schedule?.endDate || '');
    }
    setOpen(next);
  }
  async function change(schedule) {
    if (pending) return;
    setPending(true);
    const id = toast.loading(schedule ? 'Saving shift hours…' : 'Removing shift hours…');
    try {
      const result = await updateDtrShiftSchedule(student.internship_id, schedule);
      if (!result.success) { toast.error(result.error, { id }); return; }
      toast.success(result.message, { id });
      await onSaved().catch(() => {});
      setOpen(false);
    } catch {
      toast.error('Could not confirm the schedule change. Refresh before retrying.', { id });
    } finally { setPending(false); }
  }
  return <Modal open={open} onOpenChange={toggleOpen} title={`Shift hours for ${student.name}`}
    description="Set expected daily hours. Optional dates limit when they apply; leaving both blank keeps them active until removed. Overnight shifts are supported."
    trigger={<span>{student.schedule ? 'Edit hours' : 'Set hours'}</span>}
    triggerStyles="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-primary-emphasis hover:bg-muted">
    <form className="space-y-4" onSubmit={event => { event.preventDefault(); void change({ clockInTime, clockOutTime, workingDays, startDate: startDate || null, endDate: endDate || null }); }}>
      <fieldset><legend className="mb-2 text-sm font-medium">Working days</legend><div className="flex flex-wrap gap-3">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day,i)=><label key={day} className="flex items-center gap-1 text-sm"><input type="checkbox" checked={workingDays.includes(i)} onChange={e=>setWorkingDays(e.target.checked?[...workingDays,i]:workingDays.filter(d=>d!==i))}/>{day}</label>)}</div></fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">Expected clock-in<input type="time" required value={clockInTime} disabled={pending} onChange={event => setClockInTime(event.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2" /></label>
        <label className="text-sm font-medium">Expected clock-out<input type="time" required value={clockOutTime} disabled={pending} onChange={event => setClockOutTime(event.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2" /></label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">Starts on (optional)<input type="date" value={startDate} max={endDate || undefined} disabled={pending} onChange={event => setStartDate(event.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2" /></label>
        <label className="text-sm font-medium">Ends on (optional)<input type="date" value={endDate} min={startDate || undefined} disabled={pending} onChange={event => setEndDate(event.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2" /></label>
      </div>
      <p className="text-xs text-foreground-soft">Both dates include that whole shift. Leave either date blank for an open-ended period. A night shift uses the date it starts.</p>
      <p className="text-xs text-foreground-soft">Schedule edits take effect tomorrow; initial schedules can begin today. Late: 10 minutes or more after start. Undertime: before end. Overtime: 30 minutes or more after end. Times use Philippine time.</p>
      <div className="flex flex-wrap justify-end gap-2">
        {student.schedule && <Button type="button" variant="outline" disabled={pending} onClick={() => void change(null)}>Remove hours</Button>}
        <Button type="submit" disabled={pending || clockInTime === clockOutTime || Boolean(startDate && endDate && startDate > endDate)}>{pending ? 'Saving…' : 'Save hours'}</Button>
      </div>
    </form>
  </Modal>;
}
