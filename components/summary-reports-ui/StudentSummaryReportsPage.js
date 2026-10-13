"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpenText, FileText, Paperclip, Pencil, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useUser } from "@/contexts/UserContext";
import { toastAndAction } from "@/lib/helpers";
import { summaryReportKeys, summaryReportsOptions } from "@/lib/cache/summary-reports-queries";
import { deleteSummaryReport, getSummaryAttachmentUrl, saveSummaryReport } from "@/lib/server-actions/summary-reports-actions";
import PageTitle from "@/components/ui/PageTitle";
import ManualDialog from "@/components/ui/ManualDialog";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ErrorUI from "@/components/ui/ErrorUI";
import SummaryReportsSkeleton from "@/components/skeletons/SummaryReportsSkeleton";
import SummaryReportPrintButton from "./SummaryReportPrintButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SECTIONS = [
  { key: "organization_experience", title: "Working in the organization / company", hint: "Describe the company, your role, the people you worked with, and what you learned about the workplace." },
  { key: "work_schedule", title: "Work schedule", hint: "Explain your usual workdays, hours, and responsibilities." },
  { key: "memorable_moment", title: "Most memorable practicum moment", hint: "Share one meaningful experience and why it stayed with you." },
  { key: "difficulties_solutions", title: "Difficulties and solutions", hint: "Describe challenges you faced, how you handled them, and what you learned." },
];

const EMPTY = Object.fromEntries([...SECTIONS.map(({ key }) => [key, ""]), ["memorabilia_note", ""]]);
const fieldClass = "mt-2 w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary-emphasis focus:ring-2 focus:ring-primary/20";
const secondaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted";
const primaryButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

function ReportContent({ record }) {
  const [attachmentError, setAttachmentError] = useState("");

  async function openAttachment() {
    const tab = window.open("", "_blank");
    const result = await getSummaryAttachmentUrl(record.internship_id);
    if (result?.success && result.url) {
      if (tab) tab.location.href = result.url;
      else window.location.href = result.url;
    } else {
      tab?.close();
      setAttachmentError(result?.error || "Could not open the attachment.");
    }
  }

  return (
    <article className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {SECTIONS.map(({ key, title }, index) => (
          <section key={key} className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary-emphasis">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="text-sm font-semibold text-foreground sm:text-base">{title}</h3>
            </div>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground-soft">{record[key]}</p>
          </section>
        ))}
      </div>
      {(record.memorabilia_note || record.attachment_name || record.images?.length) && (
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary-emphasis">05</span>
            <h3 className="text-sm font-semibold text-foreground sm:text-base">Picture or multimedia memorabilia</h3>
          </div>
          {record.memorabilia_note && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground-soft">{record.memorabilia_note}</p>}
          {record.images?.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {record.images.map((image) => (
                <a key={image.id} href={image.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-border bg-canvas">
                  <Image unoptimized src={image.url} alt="Internship memorabilia" width={320} height={240} className="h-32 w-full object-contain" />
                </a>
              ))}
            </div>
          )}
          {record.attachment_name && (
            <button type="button" onClick={openAttachment} className="mt-3 inline-flex max-w-full items-center gap-2 break-all rounded-lg border border-border bg-canvas px-3 py-2 text-left text-sm font-medium text-primary-emphasis hover:bg-muted">
              <Paperclip className="size-4 shrink-0" aria-hidden="true" />{record.attachment_name}
            </button>
          )}
          {attachmentError && <p role="alert" className="mt-2 text-sm text-red-600">{attachmentError}</p>}
        </section>
      )}
    </article>
  );
}

function ReportEditor({ record, onSaved, onCancel }) {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [values, setValues] = useState(() => Object.fromEntries(Object.keys(EMPTY).map((key) => [key, record[key] || ""])));
  const [images, setImages] = useState([]);
  const [removeImageIds, setRemoveImageIds] = useState([]);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [error, setError] = useState("");
  const previewUrls = useRef([]);
  useEffect(() => () => previewUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);
  const retainedImages = (record.images || []).filter((image) => !removeImageIds.includes(image.id));
  const words = Object.values(values).join(" ").trim().split(/\s+/u).filter(Boolean).length;
  const mutation = useMutation({
    mutationFn: (formData) => toastAndAction({
      loadingLabel: record.report_id ? "Updating summary report..." : "Submitting summary report...",
      successLabel: record.report_id ? "Summary report updated." : "Summary report submitted.",
      errorLabel: "Could not save your report.",
      action: async (internshipId, data) => {
        try {
          return await saveSummaryReport(internshipId, data, Boolean(record.report_id));
        } catch {
          return { success: false, error: "Could not save your report. Please try again." };
        }
      },
      id: record.internship_id,
      formData,
    }),
    onSuccess: async (result) => {
      if (!result?.success) return;
      await queryClient.invalidateQueries({ queryKey: summaryReportKeys.list(user.id) });
      onSaved();
    },
    onError: () => setError("Could not save your report. Please try again."),
  });

  function submit(event) {
    event.preventDefault();
    setError("");
    if (words > 900) {
      setError("Keep the report within 900 words so it can fit the three-page format.");
      return;
    }
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) formData.set(key, value);
    images.forEach(({ file }) => formData.append("images", file));
    formData.set("remove_image_ids", JSON.stringify(removeImageIds));
    if (removeAttachment) formData.set("remove_attachment", "true");
    mutation.mutate(formData);
  }

  function selectImages(event) {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    if (selected.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024 || !file.size)) {
      setError("Choose JPG, PNG, or WebP images up to 5 MB each.");
      return;
    }
    if (retainedImages.length + images.length + selected.length > 6) {
      setError("A report can have up to six images. Remove one before adding more.");
      return;
    }
    setError("");
    const previews = selected.map((file) => ({ file, url: URL.createObjectURL(file) }));
    previewUrls.current.push(...previews.map(({ url }) => url));
    setImages((current) => [...current, ...previews]);
  }

  function removeSelectedImage(url) {
    URL.revokeObjectURL(url);
    previewUrls.current = previewUrls.current.filter((item) => item !== url);
    setImages((current) => current.filter((item) => item.url !== url));
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-xl border border-border bg-card p-4 sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">{record.report_id ? "Edit your summary report" : "Write your summary report"}</h2>
        <p className="mt-1 text-sm text-foreground-soft">Write in paragraphs using the outline below. One report is allowed for this internship; you can edit it later.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {SECTIONS.map(({ key, title, hint }) => (
          <label key={key} className="block min-w-0 text-sm font-semibold text-foreground">
            {title} <span className="text-primary-emphasis">*</span>
            <span className="mt-1 block text-xs font-normal text-foreground-soft">{hint}</span>
            <textarea required maxLength={6000} rows={7} value={values[key]} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} className={fieldClass} placeholder={`Write about ${title.toLowerCase()} in paragraph form...`} />
          </label>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <label className="block min-w-0 text-sm font-semibold text-foreground">
          Picture or multimedia memorabilia <span className="font-normal text-foreground-soft">(optional note)</span>
          <span className="mt-1 block text-xs font-normal text-foreground-soft">Describe photos or a memory from your internship.</span>
          <textarea maxLength={2000} rows={5} value={values.memorabilia_note} onChange={(event) => setValues((current) => ({ ...current, memorabilia_note: event.target.value }))} className={fieldClass} placeholder="Describe a meaningful photo or other memorabilia..." />
        </label>
        <div className="min-w-0 text-sm font-semibold text-foreground">
          Optional images
          <p className="mt-1 text-xs font-normal text-foreground-soft">Select up to six JPG, PNG, or WebP images, 5 MB each. Preview them before saving.</p>
          <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={selectImages} disabled={retainedImages.length + images.length >= 6} className={`${fieldClass} min-w-0 file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-foreground disabled:opacity-60`} />
          {(retainedImages.length > 0 || images.length > 0) && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {retainedImages.map((image) => (
                <div key={image.id} className="relative overflow-hidden rounded-lg border border-border bg-canvas">
                  <Image unoptimized src={image.url} alt="Saved internship image" width={320} height={240} className="h-28 w-full object-contain" />
                  <button type="button" aria-label="Remove saved image" onClick={() => setRemoveImageIds((current) => [...current, image.id])} className="absolute right-1 top-1 rounded-full bg-card p-1 text-foreground shadow"><X className="size-4" /></button>
                </div>
              ))}
              {images.map(({ file, url }) => (
                <div key={url} className="relative overflow-hidden rounded-lg border border-border bg-canvas">
                  <Image unoptimized src={url} alt={`Preview of ${file.name}`} width={320} height={240} className="h-28 w-full object-contain" />
                  <button type="button" aria-label={`Remove ${file.name}`} onClick={() => removeSelectedImage(url)} className="absolute right-1 top-1 rounded-full bg-card p-1 text-foreground shadow"><X className="size-4" /></button>
                </div>
              ))}
            </div>
          )}
          {record.attachment_name && (
            <label className="mt-3 flex items-start gap-2 text-xs font-normal text-foreground-soft">
              <input type="checkbox" checked={removeAttachment} onChange={(event) => setRemoveAttachment(event.target.checked)} className="mt-0.5 accent-primary" />
              <span>Remove older attachment: <span className="break-all">{record.attachment_name}</span></span>
            </label>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className={`text-xs ${words > 900 ? "text-red-600" : "text-foreground-soft"}`}>{words} / 900 words. Use Times New Roman, 12 pt, 1.5 spacing, 1-inch margins, and no more than 3 pages in the final report.</p>
        <div className="flex flex-wrap gap-2">
          {record.report_id && <button type="button" onClick={onCancel} className={secondaryButton}>Cancel</button>}
          <button type="submit" disabled={mutation.isPending || words > 900} className={primaryButton}>{mutation.isPending ? "Saving..." : record.report_id ? "Save changes" : "Submit report"}</button>
        </div>
      </div>
      {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">{error}</p>}
    </form>
  );
}

export default function StudentSummaryReportsPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const reports = useQuery({ ...summaryReportsOptions(user?.id), enabled: Boolean(user?.id) });
  const records = reports.data || [];
  const [selectedId, setSelectedId] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const record = records.find((item) => item.internship_id === selectedId) || records[0];
  const deleteMutation = useMutation({
    mutationFn: (internshipId) => toastAndAction({
      loadingLabel: "Deleting summary report...",
      successLabel: "Summary report deleted.",
      errorLabel: "Could not delete the report.",
      action: async (id) => {
        try {
          return await deleteSummaryReport(id);
        } catch {
          return { success: false, error: "Could not delete the report. Please try again." };
        }
      },
      id: internshipId,
    }),
  });

  async function handleDelete() {
    if (!record) return;
    try {
      const result = await deleteMutation.mutateAsync(record.internship_id);
      setConfirmingDelete(false);
      if (result?.success) {
        await queryClient.invalidateQueries({ queryKey: summaryReportKeys.list(user.id) });
        setEditing(false);
      }
    } catch {
      setConfirmingDelete(false);
    }
  }

  if (reports.isPending) return <SummaryReportsSkeleton />;
  if (reports.isError) return <ErrorUI error={reports.error} reset={() => reports.refetch()} logError={false} />;

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageTitle Icon={BookOpenText} title="Summary Reports" description="Reflect on your complete internship experience in one report per internship." titleAction={Boolean(record) && (
        <ManualDialog title="How to write your summary report">
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed marker:font-semibold marker:text-primary-emphasis">
            <li>Choose the internship you want to write about. You can create one report for each eligible internship.</li>
            <li>Write paragraphs about the organization, your work schedule, a memorable moment, and difficulties with their solutions.</li>
            <li>Optionally add a memorabilia note and up to six JPG, PNG, or WebP images. Preview each image before saving.</li>
            <li>Keep the report within 900 words. Follow the school format: Times New Roman, 12 pt, 1.5 line spacing, 1-inch margins, and a maximum of three pages.</li>
            <li>Select <strong>Submit report</strong>. You can edit or delete your report later. Only one report can exist for an internship at a time.</li>
            <li>Use <strong>Print</strong> to open the formatted PDF after it is ready. Your saved images appear inside it.</li>
          </ol>
        </ManualDialog>
      )} />

      {!record ? (
        <section className="rounded-xl border border-dashed border-border bg-card p-8 text-center sm:p-12">
          <FileText className="mx-auto size-9 text-primary-emphasis" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-foreground">No eligible internship yet</h2>
          <p className="mt-1 text-sm text-foreground-soft">Your approved ongoing or finished internship will appear here when it is ready for a summary report.</p>
        </section>
      ) : (
        <>
          <section className="flex flex-col gap-5 rounded-xl border border-border bg-card p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between xl:gap-8">
            <div className="flex min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:gap-7">
              <span id="summary-internship-label" className="shrink-0 text-sm font-semibold text-foreground">Internship record</span>
              <Select value={record.internship_id} onValueChange={(value) => { setSelectedId(value); setEditing(false); }}>
                <SelectTrigger aria-labelledby="summary-internship-label" className="min-h-10 w-full min-w-0 bg-canvas px-3 sm:max-w-xl">
                  <SelectValue placeholder="Choose an internship" />
                </SelectTrigger>
                <SelectContent>
                  {records.map((item) => <SelectItem key={item.internship_id} value={item.internship_id}>{item.company_name} - {item.status}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {record.report_id && !editing && (
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <button type="button" onClick={() => setEditing(true)} className={`${secondaryButton} flex-1 sm:flex-none`}><Pencil className="size-4" aria-hidden="true" />Edit</button>
                <button type="button" onClick={() => setConfirmingDelete(true)} className={`${secondaryButton} flex-1 text-red-600 hover:text-red-700 sm:flex-none dark:text-red-300`}><Trash2 className="size-4" aria-hidden="true" />Delete</button>
                <SummaryReportPrintButton internshipId={record.internship_id} className="w-full sm:w-auto" />
              </div>
            )}
          </section>
          <ConfirmDialog open={confirmingDelete} onOpenChange={setConfirmingDelete} title="Delete summary report?" description={`Delete the summary report for ${record.company_name}? Its attachment will also be removed. You can create a new report afterward.`} confirmLabel="Delete report" pending={deleteMutation.isPending} onConfirm={() => void handleDelete()} />
          {(!record.report_id || editing) ? (
            <ReportEditor key={record.internship_id} record={record} onCancel={() => setEditing(false)} onSaved={() => setEditing(false)} />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground-soft"><FileText className="size-4 text-primary-emphasis" aria-hidden="true" />Submitted summary report for <span className="font-semibold text-foreground">{record.company_name}</span><span className="w-full pl-6 text-xs">Prepared by {record.student_name || "Student"}</span></div>
              <ReportContent record={record} />
            </>
          )}
        </>
      )}
    </main>
  );
}
