"use client";
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/contexts/UserContext';
import { dutyKey } from '@/lib/cache/duty-queries';
import { saveDuty } from '@/lib/server-actions/duty-actions';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import { Button } from '../ui/button';
import DropdownFilter from '../ui/DropdownFilter';
const input = 'mt-1 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm';
const categories = [{ value: 'absent', label: 'Absent' }, { value: 'leave', label: 'Leave' }, { value: 'no_duty', label: 'Holiday / No duty' }, { value: 'worked', label: 'I worked but missed clock-in' }];
function shortDate(value) { return value ? new Date(String(value).slice(0, 10) + 'T00:00:00Z').toLocaleDateString('en-US', { timeZone: 'UTC', month: '2-digit', day: '2-digit', year: 'numeric' }) : '-'; }
export function useDutySave(onSaved) {
    const [pending, setPending] = useState(false);
    const client = useQueryClient();
    const { user } = useUser();
    async function save(value) { setPending(true); const id = toast.loading('Saving...'); try {
        const r = await saveDuty(value);
        if (!r.success) {
            toast.error(r.error, { id });
            return;
        }
        toast.success(r.message, { id });
        await Promise.all([client.invalidateQueries({ queryKey: dutyKey(user?.id) }), client.invalidateQueries({ queryKey: ['dtr'] }), client.invalidateQueries({ queryKey: ['dashboard-overview'] })]);
        onSaved?.();
    }
    catch {
        toast.error('Could not confirm the save. Refresh before retrying.', { id });
    }
    finally {
        setPending(false);
    } }
    return { pending, save };
}
export function AbsenceForm({ report, date, staff = false, onSaved }) {
    const [category, setCategory] = useState(report?.category || 'absent');
    const { pending, save } = useDutySave(onSaved);
    return <form noValidate className="space-y-3" onSubmit={e => { e.preventDefault(); if (pending)
        return; const f = Object.fromEntries(new FormData(e.currentTarget)); void save(staff ? { action: 'review', id: report.id, studentId: report.student_id, category, ...f } : { action: 'absence', internshipId: report?.internship_id, date: report?.shift_date || f.date, category, ...f }); }}>
 {report && <div className="space-y-1 text-sm"><p><strong>Shift date:</strong> {shortDate(report.shift_date)} - <strong>Reported:</strong> {report.reported_at ? new Date(report.reported_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }) : 'Not submitted'}</p><p><strong>Reason:</strong> {report.reason || 'Explanation needed'}</p><p><strong>Review:</strong> {report.review_status.replaceAll('_', ' ')}{report.review_note ? ` - ${report.review_note}` : ''}</p></div>}
 {!report && <label className="block text-sm">Shift start date<input className={input} type="date" name="date" defaultValue={date} required/></label>}
 <label className="block space-y-1 text-sm"><span>Category</span><DropdownFilter value={category} onValueChange={setCategory} options={categories} className="w-full"/></label>
 <label className="block text-sm">{staff ? 'Review note' : 'Reason'}<textarea className={input} name={staff ? 'reviewNote' : 'reason'} defaultValue={staff ? '' : report?.reason || ''} minLength={5} maxLength={2000} rows={4} required/></label>
 {staff && category === 'worked' && <div className="grid gap-3 sm:grid-cols-2"><p className="text-xs text-muted-foreground sm:col-span-2">Only enter verified work. This creates a flagged attendance correction without camera/GPS evidence. Enter net duty hours excluding breaks (within the configured daily cap).</p><label className="text-sm">Actual clock-in<input className={input} name="actualIn" type="datetime-local" required/></label><label className="text-sm">Actual clock-out<input className={input} name="actualOut" type="datetime-local" required/></label><label className="text-sm">Verified net hours<input className={input} name="hours" type="number" min="0" step="0.01" required/></label></div>}
 <p className="text-xs text-muted-foreground">Only your department head can review this report. Leave and no-duty selections require review. No hours are automatically credited. Past reports are accepted within seven days; future reports within 30 days.</p>
 <Button type="submit" disabled={pending}>{pending ? <Loader2 className="size-4 animate-spin"/> : staff ? 'Save review' : 'Submit explanation'}</Button></form>;
}
export function AbsenceDetails({ report, staff = false, prompt = false }) {
    const [open, setOpen] = useState(prompt);
    const editable = staff ? report.review_status !== 'corrected' : !['reviewed', 'corrected'].includes(report.review_status);
    return <Modal open={open} onOpenChange={setOpen} title={staff ? 'Review attendance explanation' : 'Attendance explanation'} trigger={<span>{report.reason ? 'View reason' : 'Add reason'}</span>} triggerStyles="text-primary-emphasis hover:underline text-xs">
 {editable ? <AbsenceForm report={report} staff={staff} onSaved={() => setOpen(false)}/> : <div className="space-y-2 text-sm"><p>{report.reason || 'No reason submitted.'}</p><p>Shift: {shortDate(report.shift_date)}</p><p>Reported: {report.reported_at ? new Date(report.reported_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }) : '-'}</p><p>Review: {report.review_status} - {report.review_note || '-'}</p></div>}</Modal>;
}
