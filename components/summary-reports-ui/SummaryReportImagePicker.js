"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { fieldClass } from "./summaryReportFields";

export default function SummaryReportImagePicker({
  record,
  images,
  retainedImages,
  setRemoveImageIds,
  removeAttachment,
  setRemoveAttachment,
  selectImages,
  removeSelectedImage,
}) {
  return (
    <div className="min-w-0 text-sm font-semibold text-foreground">
      Optional images
      <p className="mt-1 text-xs font-normal text-foreground-soft">Select up to six JPG, PNG, or WebP images, 5 MB each. Preview them before saving.</p>
      <input
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={selectImages}
        disabled={retainedImages.length + images.length >= 6}
        className={`${fieldClass} min-w-0 file:mr-3 file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-foreground disabled:opacity-60`}
      />
      {(retainedImages.length > 0 || images.length > 0) && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {retainedImages.map((image) => (
            <div key={image.id} className="relative overflow-hidden rounded-lg border border-border bg-canvas">
              <Image
                unoptimized
                src={image.url}
                alt="Saved internship image"
                width={320}
                height={240}
                className="h-28 w-full object-contain"
              />
              <button
                type="button"
                aria-label="Remove saved image"
                onClick={() => setRemoveImageIds((current) => [...current, image.id])}
                className="absolute right-1 top-1 rounded-full bg-card p-1 text-foreground shadow"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
          {images.map(({ file, url }) => (
            <div key={url} className="relative overflow-hidden rounded-lg border border-border bg-canvas">
              <Image
                unoptimized
                src={url}
                alt={`Preview of ${file.name}`}
                width={320}
                height={240}
                className="h-28 w-full object-contain"
              />
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => removeSelectedImage(url)}
                className="absolute right-1 top-1 rounded-full bg-card p-1 text-foreground shadow"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      {record.attachment_name && (
        <label className="mt-3 flex items-start gap-2 text-xs font-normal text-foreground-soft">
          <input
            type="checkbox"
            checked={removeAttachment}
            onChange={(event) => setRemoveAttachment(event.target.checked)}
            className="mt-0.5 accent-primary"
          />
          <span>Remove older attachment: <span className="break-all">{record.attachment_name}</span></span>
        </label>
      )}
    </div>
  );
}
