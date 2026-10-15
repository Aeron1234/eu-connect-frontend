"use client";

import { MapPin } from "lucide-react";
import MapFormContainer from "../map-ui/MapFormContainer";
import useSetDtrLocation from "./useSetDtrLocation";
import DtrLocationConfirmation from "./DtrLocationConfirmation";
import DtrLiveLocationPanel from "./DtrLiveLocationPanel";
import DtrLocationFields from "./DtrLocationFields";
import DtrLocationActions from "./DtrLocationActions";

function SetDtrLocation({ studentId, dataLocation = {}, onSaved }) {
  const {
    loc,
    setLoc,
    radius,
    setRadius,
    isPending,
    confirmation,
    setConfirmation,
    isCustom,
    liveLocation,
    liveStatus,
    handleUseSharedLocation,
    handleSetLocation,
    handleRemove,
    defaultCoords,
  } = useSetDtrLocation({ studentId, dataLocation, onSaved });
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 mt-4 space-y-4">
      <DtrLocationConfirmation
        confirmation={confirmation}
        setConfirmation={setConfirmation}
        isCustom={isCustom}
        isPending={isPending}
        handleRemove={handleRemove}
        handleSetLocation={handleSetLocation}
      />
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary-emphasis">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">
            DTR Location
          </h3>
          <p className="text-xs text-foreground-soft mt-0.5">
            Set the on-site location where the student is allowed to record
            their DTR — both clock-in and clock-out must be done within the
            allowed radius. Tap the map to drop a pin, then adjust the radius.
          </p>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-border/60">
        <MapFormContainer
          data={loc}
          setData={setLoc}
          mapStyle={{ height: "400px", width: "100%" }}
          formType={"setDtrLocation"}
          defaultCoords={defaultCoords}
          radius={radius}
          setRadius={setRadius}
          liveLocation={liveLocation}
        />
      </div>

      <DtrLiveLocationPanel
        liveStatus={liveStatus}
        liveLocation={liveLocation}
        radius={radius}
        handleUseSharedLocation={handleUseSharedLocation}
        isPending={isPending}
      />

      <DtrLocationFields loc={loc} setLoc={setLoc} radius={radius} setRadius={setRadius} isPending={isPending} />

      <DtrLocationActions loc={loc} isPending={isPending} setConfirmation={setConfirmation} />
    </div>
  );
}

export default SetDtrLocation;
