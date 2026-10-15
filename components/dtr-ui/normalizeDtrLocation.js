export default function normalizeDtrLocation(raw) {
  const r = raw || {};
  return {
    internship_id: r?.internship_id,
    is_custom_location: r?.is_custom_location || false,
    location: {
      lat: r?.location?.lat,
      lon: r?.location?.lon,
      radius_meters: r?.location?.radius_meters,
      label: r?.location?.label,
      address: r?.location?.address || null,
      set_by: r?.location?.set_by || null,
      created_at: r?.location?.created_at || null,
      updated_at: r?.location?.updated_at || null,
    },
  };
}
