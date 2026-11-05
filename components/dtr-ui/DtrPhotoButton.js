"use client";

import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import Modal from "../ui/Modal";
import { getDtrPhoto } from "@/lib/server-actions/dtr-actions";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";

export default function DtrPhotoButton({ dtrId, kind }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      const result = await getDtrPhoto(dtrId, kind);
      if (!active) return;
      setUrl(result.success ? result.url : "");
      setError(result.success ? "" : result.error || "Photo unavailable.");
      setLoading(false);
    }
    void load();
    return () => { active = false; setUrl(""); };
  }, [open, dtrId, kind]);

  return <Modal
    open={open}
    onOpenChange={setOpen}
    title={`${kind === "in" ? "Clock-in" : "Clock-out"} photo`}
    trigger={<span className="inline-flex items-center gap-1"><Camera className="size-3.5" />View {kind === "in" ? "in" : "out"}</span>}
    triggerStyles="rounded-md border border-border px-2 py-1 text-xs text-primary-emphasis hover:bg-accent hover:underline"
  >
    <div className="flex min-h-48 items-center justify-center">
      {loading ? <Spinner className="size-6" /> : error ? <p role="alert" className="text-sm text-destructive">{error}</p> : url ? (
        <Image src={url} alt={`${kind === "in" ? "Clock-in" : "Clock-out"} attendance evidence with timestamp`} width={1280} height={960} unoptimized className="max-h-[65dvh] max-w-full rounded-lg object-contain" />
      ) : null}
    </div>
  </Modal>;
}
