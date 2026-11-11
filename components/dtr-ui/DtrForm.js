"use client";

import ModalForm from "@/components/ui/ModalForm";
import { clockIn, clockOut } from "@/lib/server-actions/dtr-actions";
import { useState } from "react";
import { useRef } from "react";
import Webcam from "react-webcam";
import Image from "next/image";
import { toastAndAction, useGetLocation } from "../../lib/helpers";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { prepareAttendancePhoto } from "@/lib/attendance-camera.mjs";

function DtrForm({ isOut, onSuccess, onSettled }) {
  // isOut means currently CLOCKED_OUT, so this form will clock in.
  const action = isOut ? clockIn : clockOut;

  const [isPending, setIsPending] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [cameraFacingMode, setCameraFacingMode] = useState("environment");
  const webcamRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const { refreshLocation } = useGetLocation(false);

  async function handleAction(formData) {
    if (isPending) return;
    if (!photoFile) {
      toast.error("Take an attendance photo before continuing.");
      return;
    }
    setIsPending(true);
    let actionStarted = false;
    try {
      // Get the position at submission time. The modal may open before a
      // phone has its first GPS fix, and an earlier reading may be stale.
      const { latitude, longitude } = await refreshLocation();
      formData.set(isOut ? "lat_in" : "lat_out", String(latitude));
      formData.set(isOut ? "lon_in" : "lon_out", String(longitude));
      formData.set("photo", photoFile);

      actionStarted = true;
      const result = await toastAndAction({
        loadingLabel: isOut ? "Clocking in..." : "Clocking out...",
        successLabel: isOut ? "Clocked in!" : "Clocked out!",
        errorLabel: isOut ? "Failed to clock in." : "Failed to clock out.",
        action,
        args: [formData],
      });
      if (result?.success) onSuccess?.();
    } catch (error) {
      // toastAndAction already reports action failures. GPS errors need their own toast.
      if (!actionStarted) toast.error(error.message || "Could not get your current location. Please try again.");
    } finally {
      // Close this DTR confirmation after either result, including a GPS failure.
      setIsPending(false);
      onSettled?.();
    }
  }

  async function capturePhoto() {
    if (capturing || isPending || !cameraReady) return;
    const image = webcamRef.current?.getScreenshot();
    if (!image) {
      setCameraError("The camera could not capture a photo. Check camera permission and try again.");
      return;
    }
    setCapturing(true);
    try {
      const { blob, preview } = await prepareAttendancePhoto(image, zoom);
      setPhotoFile(new File([blob], "attendance.jpg", { type: "image/jpeg" }));
      setPhoto(preview);
      setCameraError("");
    } catch {
      setCameraError("The photo could not be prepared. Please take it again.");
    } finally {
      setCapturing(false);
    }
  }

  return (
    <ModalForm.Root action={handleAction} className="w-full">
      <ModalForm.Section title="Attendance photo" description="Take a clear photo and review it before submitting.">
      <p className="text-xs text-foreground-soft">
        Take a clear photo, review it, then record your {isOut ? "clock-in" : "clock-out"}. The official Philippine time is stamped onto the saved image.
      </p>
      <div className="space-y-2">
        <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-muted">
        {photo ? (
          <Image src={photo} alt="Your attendance photo preview" width={1280} height={960} unoptimized className="h-full w-full object-cover" />
        ) : (
          <Webcam
            key={cameraFacingMode}
            ref={webcamRef}
            audio={false}
            mirrored={cameraFacingMode === "user"}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.8}
            videoConstraints={{ facingMode: { ideal: cameraFacingMode }, width: { ideal: 1280 }, height: { ideal: 960 } }}
            onUserMedia={() => { setCameraError(""); setCameraReady(true); }}
            onUserMediaError={() => { setCameraReady(false); setCameraError("Camera access is unavailable. Allow camera permission and try again."); }}
            className="h-full w-full object-cover"
            style={{ transform: `scale(${zoom})` }}
          />
        )}
        </div>
        {!photo && <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg bg-muted/40 px-3 py-2">
          <button type="button" aria-label="Zoom out" disabled={!cameraReady || capturing || isPending || zoom <= 1} onClick={() => setZoom(z => Math.max(1, z - 0.25))} className="rounded-md border border-border p-2 disabled:opacity-40"><Minus className="size-4"/></button>
          <input type="range" aria-label="Camera zoom" min="1" max="3" step="0.25" value={zoom} disabled={!cameraReady || capturing || isPending} onChange={e => setZoom(Number(e.target.value))} className="min-w-0 flex-1 accent-primary sm:max-w-64"/>
          <button type="button" aria-label="Zoom in" disabled={!cameraReady || capturing || isPending || zoom >= 3} onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="rounded-md border border-border p-2 disabled:opacity-40"><Plus className="size-4"/></button>
          <output className="w-12 text-right text-xs tabular-nums" aria-live="polite">{zoom.toFixed(2)}×</output>
        </div>}
        {!photo && <p className="text-xs text-foreground-soft">Digital zoom crops the photo from 1× to 3×. Higher zoom reduces image detail.</p>}
        {cameraError && <p role="alert" className="text-xs text-destructive">{cameraError}</p>}
        {photo && <p className="text-xs text-foreground-soft">Preview only. The saved image will include the server time.</p>}
        <div className="flex gap-2">
          <button type="button" disabled={isPending || capturing || (!photo && !cameraReady)} onClick={photo ? () => { setPhoto(null); setPhotoFile(null); setCameraReady(false); } : capturePhoto}
            className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50">
            {capturing ? "Capturing…" : photo ? "Retake photo" : "Take photo"}
          </button>
          {!photo && <button type="button" disabled={isPending || capturing} onClick={() => {
            setCameraError("");
            setCameraReady(false);
            setZoom(1);
            setCameraFacingMode(current => current === "environment" ? "user" : "environment");
          }} className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50">
            Switch camera
          </button>}
        </div>
      </div>
      </ModalForm.Section>
      <ModalForm.Actions isPending={isPending} submitDisabled={!photoFile} submitLabel={isOut ? "Clock in" : "Clock out"} closeOnSubmit={false} disableCancelWhilePending />
    </ModalForm.Root>
  );
}

export default DtrForm;
