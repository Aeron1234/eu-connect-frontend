"use client";
import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';

export default function SelectedCompanyDrawer({ open, onOpenChange, returnFocusRef, children }) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-60 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 duration-200 motion-reduce:animate-none" />
      <Dialog.Content aria-describedby={undefined}
        onCloseAutoFocus={(event) => { if (returnFocusRef.current) { event.preventDefault(); returnFocusRef.current.focus(); } }}
        className="fixed inset-y-0 left-0 z-70 flex w-[calc(100%-2rem)] max-w-sm flex-col border-r border-border bg-card text-foreground shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left duration-250 ease-out motion-reduce:animate-none">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <Dialog.Title className="text-sm font-semibold">Company details</Dialog.Title>
          <Dialog.Close asChild><button type="button" aria-label="Close company details" className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><X className="size-4" /></button></Dialog.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
