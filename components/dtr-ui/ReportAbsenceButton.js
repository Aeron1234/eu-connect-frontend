"use client";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/contexts/UserContext';
import { dutyOptions } from '@/lib/cache/duty-queries';
import Modal from '../ui/Modal';
import { AbsenceForm } from './AbsenceDetails';
export default function ReportAbsenceButton({ hasOpenShift }) {
    const { user } = useUser();
    const [open, setOpen] = useState(false);
    const query = useQuery(dutyOptions(user?.id));
    if (hasOpenShift || !query.data?.canReport)
        return null;
    return <Modal open={open} onOpenChange={setOpen} title="Report absence / no duty" trigger={<span>Report absence</span>} triggerStyles="rounded-md border border-white/60 px-3 py-2 text-xs text-white hover:bg-white/10">
 <AbsenceForm date={query.data.duty.shift_date} onSaved={() => setOpen(false)}/></Modal>;
}
