"use client";
import { useState } from "react";
import Image from "next/image";
import { FileText, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePdfPreview } from "@/components/ui/PdfPreviewProvider";
import Modal from "@/components/ui/Modal";

export function attachmentKind(attachment) {
  const mime = String(attachment.mime_type || attachment.mime || "").split(";")[0].toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf" || (!mime && /\.pdf$/i.test(attachment.filename || ""))) return "pdf";
  return "file";
}
export default function FeedbackAttachments({ postId, attachments = [] }) {
  const { previewPdf } = usePdfPreview();
  if (!attachments.length) return null;
  return <div className="mt-4 grid min-w-0 gap-3" aria-label="Attachments">{attachments.map(attachment => {
    // Use the same-origin authorized endpoint for inline images and PDF preview.
    // Original download is explicit; neither view exposes a permanent storage URL.
    const url = "/api/feedback/" + encodeURIComponent(postId) + "/attachments/" + encodeURIComponent(attachment.id);
    return attachmentKind(attachment) === "image" ? <FeedbackImage key={attachment.id} attachment={attachment} url={url} /> :
      <div key={attachment.id} className="flex min-w-0 items-center gap-2 rounded-lg border border-border p-3">
        <FileText className="size-4 shrink-0 text-primary-emphasis" />
        <button type="button" className="min-w-0 flex-1 text-left text-sm text-primary-emphasis hover:underline" onClick={() => previewPdf({
          filename: attachment.filename, load: signal => fetch(url, { signal, cache: "no-store" }),
        })}><span className="block break-all">{attachment.filename}</span><span className="text-xs text-muted-foreground">Preview PDF</span></button>
        <a href={url + "?download=1"} aria-label={"Download " + attachment.filename} className="rounded-md p-2 hover:bg-muted"><Download className="size-4" /></a>
      </div>;
  })}</div>;
}
function FeedbackImage({ attachment, url }) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const src = url + "?attempt=" + attempt;
  return <figure className="min-w-0 overflow-hidden rounded-lg border border-border bg-muted/20">
    {failed ? <div className="p-4 text-sm text-muted-foreground"><p>Could not load this image.</p><Button type="button" variant="ghost" size="sm" onClick={() => { setAttempt(value => value + 1); setFailed(false); }}><RefreshCw className="mr-1 size-3" />Retry</Button></div> :
      <Modal title={attachment.filename} triggerStyles="block w-full" trigger={<Image unoptimized src={src} alt={attachment.filename} width={960} height={640} onError={() => setFailed(true)} className="max-h-72 w-full object-contain" />}>
        <Image unoptimized src={src} alt={attachment.filename} width={1200} height={900} className="max-h-[70dvh] w-full object-contain" />
      </Modal>}
    <figcaption className="flex min-w-0 items-center gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
      <span className="min-w-0 flex-1 break-all">{attachment.filename}</span>
      <a href={url + "?download=1"} aria-label={"Download " + attachment.filename} className="shrink-0 rounded-md p-2 hover:bg-muted"><Download className="size-4" /></a>
    </figcaption>
  </figure>;
}
