"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormDialogContent from "@/components/ui/FormDialogContent";
import ModalForm from "@/components/ui/ModalForm";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ErrorUI from "@/components/ui/ErrorUI";
import { previewActivityLogBatchDelete } from "@/lib/server-actions/activity-logs-actions";

const displayDate = (value) => format(new Date(`${value}T00:00:00`), "MMMM d, yyyy");
const modalButtonClass = "h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm";

export default function ActivityLogsBatchDelete({ disabled, onDelete, pending }) {
  const [open, setOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [throughDate, setThroughDate] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const checkingRef = useRef(false);
  const deletingRef = useRef(false);
  const busy = pending || checking;
  const reversed = Boolean(fromDate && throughDate && fromDate > throughDate);

  function updateDate(setDate, value) {
    setDate(value);
    setPreview(null);
    setError(null);
  }

  async function checkRange(event) {
    event?.preventDefault();
    if (checkingRef.current || !fromDate || !throughDate || reversed) return;
    checkingRef.current = true;
    setChecking(true);
    setError(null);
    setPreview(null);
    try {
      const result = await previewActivityLogBatchDelete({ fromDate, throughDate });
      if (!result?.success || !Number.isSafeInteger(result.count) || result.count < 0) {
        setError({ message: result?.error || "Could not count activity logs.", status: result?.status });
        return;
      }
      setPreview({ fromDate, throughDate, count: result.count });
    } catch {
      setError({ message: "Could not reach the server. Please try again." });
    } finally {
      checkingRef.current = false;
      setChecking(false);
    }
  }

  async function confirmDeletion() {
    if (deletingRef.current || !confirmation || pending) return;
    deletingRef.current = true;
    try {
      const result = await onDelete(confirmation);
      if (result?.success) {
        setConfirmation(null);
        setPreview(null);
      }
    } finally {
      deletingRef.current = false;
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2 sm:w-auto"
        disabled={disabled || busy}
        onClick={() => { setPreview(null); setError(null); setOpen(true); }}
      >
        <Trash2 className="size-4" aria-hidden="true" />
        Delete by date range
      </Button>
      <Dialog open={open} onOpenChange={(next) => { if (!busy) setOpen(next); }}>
        <FormDialogContent
          title="Delete activity logs by date range"
          description="Choose the dates to review before deleting. Both dates include the full day in Philippine time."
          showCloseButton={!busy}
        >
          <ModalForm.Root onSubmit={checkRange}>
            <ModalForm.Section title="Date range">
              <ModalForm.Row>
                <ModalForm.Field label="From">
                  <ModalForm.Input
                    type="date" required value={fromDate} disabled={busy}
                    min="1000-01-01" max={throughDate || "9999-12-31"}
                    onChange={(event) => updateDate(setFromDate, event.target.value)}
                  />
                </ModalForm.Field>
                <ModalForm.Field label="Through">
                  <ModalForm.Input
                    type="date" required value={throughDate} disabled={busy}
                    min={fromDate || "1000-01-01"} max="9999-12-31"
                    onChange={(event) => updateDate(setThroughDate, event.target.value)}
                  />
                </ModalForm.Field>
              </ModalForm.Row>
              {reversed && <p role="alert" className="text-xs text-destructive">Through date must be on or after From date.</p>}
              <p className="text-xs leading-relaxed text-foreground-subtle">
                This includes all roles and modules in the range, regardless of the page filters. Only activity logs are deleted; accounts and internship records are unaffected.
              </p>
              {preview && (
                <div role="status" className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground">
                  {preview.count === 0 ? "No activity logs match this date range." : `${preview.count.toLocaleString()} activity log${preview.count === 1 ? "" : "s"} currently match this date range.`}
                </div>
              )}
              {error && (
                <ErrorUI error={error} reset={() => void checkRange()} compact logError={false} />
              )}
            </ModalForm.Section>
            <ModalForm.Footer>
              <div className="flex w-full flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" className={modalButtonClass} disabled={busy} onClick={() => setOpen(false)}>Cancel</Button>
                {preview?.count > 0 ? (
                  <Button type="button" className={modalButtonClass} disabled={busy || disabled} onClick={() => { setConfirmation(preview); setOpen(false); }}>
                    Review deletion
                  </Button>
                ) : (
                  <Button type="submit" className={modalButtonClass} disabled={busy || disabled || !fromDate || !throughDate || reversed}>
                    {checking ? "Checking..." : "Check matching logs"}
                  </Button>
                )}
              </div>
            </ModalForm.Footer>
          </ModalForm.Root>
        </FormDialogContent>
      </Dialog>
      <ConfirmDialog
        open={Boolean(confirmation)}
        onOpenChange={(next) => { if (!next) setConfirmation(null); }}
        title="Delete these activity logs?"
        description={confirmation ? `Delete all activity logs from ${displayDate(confirmation.fromDate)} through ${displayDate(confirmation.throughDate)} (Philippine time)? ${confirmation.count.toLocaleString()} currently match; the count may change before deletion. Page filters do not apply. This cannot be undone.` : ""}
        confirmLabel="Delete logs"
        intent="warning"
        pending={pending}
        onConfirm={confirmDeletion}
      />
    </>
  );
}
