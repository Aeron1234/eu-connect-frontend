"use client";
import { Info } from 'lucide-react';
import Modal from '@/components/ui/Modal';

export default function AnalyticsDetails({title,children}) {
  return <Modal title={title} trigger={<><Info className="size-3.5"/>Details</>} triggerStyles="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-xs text-primary-emphasis hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring" >
    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
  </Modal>;
}
