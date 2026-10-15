"use client";

export default function DtrLiveLocationPanel({ liveStatus, liveLocation, radius, handleUseSharedLocation, isPending }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted p-3 text-xs">
      <div className="min-w-0 text-foreground-soft" role="status">
        <p>{liveStatus}</p>
        {liveLocation && (
          <p className="mt-1">
            Blue pin: about {Math.round(liveLocation.accuracy)} m accuracy.
            {Number(liveLocation.accuracy) > Number(radius) &&
              " This is wider than the allowed DTR radius; verify the position before saving."}
          </p>
        )}
      </div>
      {liveLocation && (
        <button
          type="button"
          onClick={handleUseSharedLocation}
          disabled={isPending}
          className="rounded-md bg-primary px-3 py-2 font-medium text-white disabled:opacity-50"
        >
          Use student&apos;s pin
        </button>
      )}
    </div>
  );
}
