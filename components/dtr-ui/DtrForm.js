"use client";

import ModalForm from "@/components/ui/ModalForm";
import { clockIn, clockOut } from "@/lib/server-actions/dtr-actions";
import { useState } from "react";
import { useRef } from "react";
import Webcam from "react-webcam";
import Image from "next/image";
import { toastAndAction, useGetLocation } from "../../lib/helpers";
import { toast } from "sonner";

function DtrForm({ isOut, onSuccess, onSettled }) {
  // isOut means currently CLOCKED_OUT, so this form will clock in.
  const action = isOut ? clockIn : clockOut;

  const [isPending, setIsPending] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [cameraFacingMode, setCameraFacingMode] = useState("environment");
  const webcamRef = useRef(null);

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
    const image = webcamRef.current?.getScreenshot();
    if (!image) {
      setCameraError("The camera could not capture a photo. Check camera permission and try again.");
      return;
    }
    try {
      const blob = await (await fetch(image)).blob();
      setPhotoFile(new File([blob], "attendance.jpg", { type: "image/jpeg" }));
      setPhoto(image);
      setCameraError("");
    } catch {
      setCameraError("The photo could not be prepared. Please take it again.");
    }
  }

  return (
    <ModalForm.Root action={handleAction} className="w-full">
      <ModalForm.Confirmation>
        Take a clear photo, review it, then record your {isOut ? "clock-in" : "clock-out"}. The official Philippine time is stamped onto the saved image.
      </ModalForm.Confirmation>
      <div className="space-y-2">
        {photo ? (
          <Image src={photo} alt="Your attendance photo preview" width={960} height={720} unoptimized className="aspect-video w-full rounded-lg border border-border object-cover" />
        ) : (
          <Webcam
            key={cameraFacingMode}
            ref={webcamRef}
            audio={false}
            mirrored={cameraFacingMode === "user"}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.8}
            videoConstraints={{ facingMode: { ideal: cameraFacingMode }, width: { ideal: 960 }, height: { ideal: 720 } }}
            onUserMedia={() => setCameraError("")}
            onUserMediaError={() => setCameraError("Camera access is unavailable. Allow camera permission and try again.")}
            className="aspect-video w-full rounded-lg border border-border bg-muted object-cover"
          />
        )}
        {cameraError && <p role="alert" className="text-xs text-destructive">{cameraError}</p>}
        {photo && <p className="text-xs text-foreground-soft">Preview only. The saved image will include the server time.</p>}
        <div className="flex gap-2">
          <button type="button" disabled={isPending} onClick={photo ? () => { setPhoto(null); setPhotoFile(null); } : capturePhoto}
            className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50">
            {photo ? "Retake photo" : "Take photo"}
          </button>
          {!photo && <button type="button" disabled={isPending} onClick={() => {
            setCameraError("");
            setCameraFacingMode(current => current === "environment" ? "user" : "environment");
          }} className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50">
            Switch camera
          </button>}
        </div>
      </div>
      <ModalForm.Actions isPending={isPending} submitDisabled={!photoFile} submitLabel={isOut ? "Clock in" : "Clock out"} closeOnSubmit={false} disableCancelWhilePending />
    </ModalForm.Root>
  );
}

export default DtrForm;
