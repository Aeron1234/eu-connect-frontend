"use client";
import { useId, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { dutyKey } from '@/lib/cache/duty-queries';
import { saveDuty } from '@/lib/server-actions/duty-actions';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import ModalForm from '../ui/ModalForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { controlClass, modalFormSelectContentClass } from '../ui/modalFormStyles';
const categories = [{ value: 'absent', label: 'Absent' }, { value: 'leave', label: 'Leave' }, { value: 'no_duty', label: 'Holiday / No duty' }, { value: 'worked', label: 'I worked but missed clock-in' }];
function shortDate(value) { return value ? new Date(String(value).slice(0, 10) + 'T00:00:00Z').toLocaleDateString('en-US', { timeZone: 'UTC', month: '2-digit', day: '2-digit', year: 'numeric' }) : '-'; }
export function useDutySave(onSaved) {
    const [pending, setPending] = useState(false);
    const client = useQueryClient();
    const router = useRouter();
    const { user } = useUser();
    async function save(value) { setPending(true); const id = toast.loading('Saving...'); try {
        const r = await saveDuty(value);
        if (!r.success) {
            toast.error(r.error, { id });
            return;
        }
        toast.success(r.message, { id });
        await Promise.all([client.invalidateQueries({ queryKey: dutyKey(user?.id) }), client.invalidateQueries({ queryKey: ['dtr'] }), client.invalidateQueries({ queryKey: ['dashboard-overview'] })]);
        // Attendance is a server-rendered list; Query invalidation alone cannot
        // refresh its newly merged absence/review rows after a successful save.
        router.refresh();
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
    const categoryId = useId();
    const [category, setCategory] = useState(report?.category || 'absent');
    const { pending, save } = useDutySave(onSaved);
    return <ModalForm.Root onSubmit={e => { e.preventDefault(); if (pending)
        return; const f = Object.fromEntries(new FormData(e.currentTarget)); void save(staff ? { action: 'review', id: report.id, studentId: report.student_id, category, ...f } : { action: 'absence', internshipId: report?.internship_id, date: report?.shift_date || f.date, category, ...f }); }}>
 <ModalForm.Section title={staff ? 'Review attendance report' : 'Attendance explanation'}>
 {report && <div className="space-y-1 text-sm"><p><strong>Shift date:</strong> {shortDate(report.shift_date)} - <strong>Reported:</strong> {report.reported_at ? new Date(report.reported_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }) : 'Not submitted'}</p><p><strong>Reason:</strong> {report.reason || 'Explanation needed'}</p><p><strong>Review:</strong> {report.review_status.replaceAll('_', ' ')}{report.review_note ? ` - ${report.review_note}` : ''}</p></div>}
 {!report && <ModalForm.Field label="Shift start date"><ModalForm.Input type="date" name="date" defaultValue={date} required disabled={pending}/></ModalForm.Field>}
 <div className="flex min-w-0 flex-col gap-1">
 <label htmlFor={categoryId} className="text-xs font-medium leading-5 text-foreground-soft">Category</label>
 <Select value={category} onValueChange={setCategory} disabled={pending}>
 <SelectTrigger id={categoryId} className={`${controlClass} text-left *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:flex-1`}><SelectValue placeholder="Select a category"/></SelectTrigger>
 <SelectContent position="popper" align="start" className={modalFormSelectContentClass}>
 {categories.map(option => <SelectItem key={option.value} value={option.value} className="whitespace-normal break-words py-2">{option.label}</SelectItem>)}
 </SelectContent></Select></div>
 <ModalForm.Field label={staff ? 'Review note' : 'Reason'}><ModalForm.Textarea name={staff ? 'reviewNote' : 'reason'} defaultValue={staff ? '' : report?.reason || ''} minLength={5} maxLength={2000} rows={4} required disabled={pending}/></ModalForm.Field>
 {staff && category === 'worked' && <>
 <p className="text-xs text-muted-foreground">Only enter verified work. This creates a flagged attendance correction without camera/GPS evidence. Enter net duty hours excluding breaks (within the configured daily cap).</p>
 <ModalForm.Row><ModalForm.Field label="Actual clock in"><ModalForm.Input name="actualIn" type="datetime-local" required disabled={pending}/></ModalForm.Field><ModalForm.Field label="Actual clock out"><ModalForm.Input name="actualOut" type="datetime-local" required disabled={pending}/></ModalForm.Field></ModalForm.Row>
 <ModalForm.Field label="Verified net hours"><ModalForm.Input name="hours" type="number" min="0" step="0.01" required disabled={pending}/></ModalForm.Field>
 </>}
 <p className="text-xs text-muted-foreground">Only your department head can review this report. Leave and no-duty selections require review. No hours are automatically credited. Past reports are accepted within seven days; future reports within 30 days.</p>
 </ModalForm.Section>
 <ModalForm.Actions isPending={pending} submitLabel={staff ? 'Save review' : 'Submit explanation'} closeOnSubmit={false} disableCancelWhilePending />
 </ModalForm.Root>;
}
export function AbsenceDetails({ report, staff = false, prompt = false }) {
    const [open, setOpen] = useState(prompt);
    const reviewed = ['reviewed', 'corrected'].includes(report.review_status);
    const editable = staff ? report.review_status !== 'corrected' : !['reviewed', 'corrected'].includes(report.review_status);
    const actionLabel = reviewed ? 'View report' : staff ? 'Review report' : report.reason?.trim() ? 'View reason' : 'Add reason';
    return <Modal variant="form" open={open} onOpenChange={setOpen} title={staff ? 'Review attendance explanation' : 'Attendance explanation'} trigger={<span>{actionLabel}</span>} triggerStyles="text-primary-emphasis hover:underline text-xs">
 {editable ? <AbsenceForm report={report} staff={staff} onSaved={() => setOpen(false)}/> : <div className="space-y-2 overflow-y-auto px-4 py-5 text-sm sm:px-6"><p>{report.reason || 'No reason submitted.'}</p><p>Shift: {shortDate(report.shift_date)}</p><p>Reported: {report.reported_at ? new Date(report.reported_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }) : '-'}</p><p>Review: {report.review_status} - {report.review_note || '-'}</p></div>}</Modal>;
}
