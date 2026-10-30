"use client";

import L from 'leaflet';
import { Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import MapForm from '@/components/map-ui/MapForm';
import StudentAvatar from './StudentAvatar';

function SavedPins({ locations, hasDraft }) {
  const map = useMap();
  useEffect(() => { map.invalidateSize(); }, [map]);
  useEffect(() => {
    if (!hasDraft && locations.length) map.fitBounds(locations.map(group => [group.lat, group.lon]), { padding: [36, 36], maxZoom: 14 });
  }, [map, locations, hasDraft]);
  return locations.map(group => <Marker key={group.key} position={[group.lat, group.lon]}
    icon={L.divIcon({ className: '', html: `<span style="display:flex;align-items:center;justify-content:center;background:#1d4ed8;color:white;border:2px solid white;border-radius:50%;width:32px;height:32px;font-weight:700;box-shadow:0 1px 5px #0007">${group.students.length}</span>`, iconSize: [32, 32], iconAnchor: [16, 16] })}>
    <Popup maxWidth={290} minWidth={230}>
      <div className="space-y-2 text-sm">
        <strong className="block break-words">{group.address || `${group.lat}, ${group.lon}`}</strong>
        <span>{group.students.length} assigned {group.students.length === 1 ? 'student' : 'students'} in your current filters</span>
        <ul className="max-h-56 space-y-2 overflow-y-auto" aria-label="Assigned students">{group.students.map(student => <li key={student.internship_id} className="flex items-center gap-2">
          <StudentAvatar student={student} /><span><span className="block font-medium">{student.name}</span><span className="text-xs">{student.location.radius_meters} m ? {student.location_source === 'company_default' ? 'Company default' : 'Custom'}{student.location.label ? ` · ${student.location.label}` : ''}</span></span>
        </li>)}</ul>
      </div>
    </Popup>
  </Marker>);
}

export default function BulkDtrMap({ draft, setDraft, radius, setRadius, locations }) {
  return <MapForm data={draft} setData={setDraft} formType="setDtrLocation" radius={radius} setRadius={setRadius}>
    <SavedPins locations={locations} hasDraft={draft.lat !== '' && draft.lon !== ''} />
  </MapForm>;
}
