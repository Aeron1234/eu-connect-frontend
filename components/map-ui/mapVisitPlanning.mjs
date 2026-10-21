export const DEFAULT_MAP_ORIGIN = { lat: 13.9304557, lng: 121.4312752, label: "MSEUF–Candelaria" };

export function directionsUrl(site, origin = DEFAULT_MAP_ORIGIN) {
  if (!site || !Number.isFinite(site.lat) || !Number.isFinite(site.lng)) return null;
  const query = new URLSearchParams({ api: "1", origin: `${origin.lat},${origin.lng}`, destination: `${site.lat},${site.lng}`, travelmode: "driving" });
  return `https://www.google.com/maps/dir/?${query}`;
}

export function routeDistance(meters) {
  return `${(meters / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })} km`;
}

export function routeDuration(seconds) {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} hr${minutes % 60 ? ` ${minutes % 60} min` : ""}`;
}

// Counts use student identity, so duplicate records cannot inflate the
// number of people reachable by visiting a city.
function localityKey(value = "") {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/^city of\s+/, "").replace(/\s+city$/, "").trim().replace(/\s+/g, " ");
}

export function groupSitesByCity(sites) {
  const groups = new Map();
  for (const site of sites) {
    const name = site.city_name?.trim();
    const province = site.province_name?.trim() || "";
    const key = site.city_code || (name && province ? `${localityKey(name)}|${localityKey(province)}` : "unclassified");
    if (!groups.has(key)) groups.set(key, { id: key, name: key === "unclassified" ? "City not classified" : name, province: key === "unclassified" ? "" : province, sites: [], students: new Map() });
    const group = groups.get(key);
    group.sites.push(site);
    for (const intern of site.interns) group.students.set(intern.studentId || intern.id, intern);
  }
  return Array.from(groups.values(), group => ({ ...group, studentCount: group.students.size, companyCount: group.sites.length, students: Array.from(group.students.values()) }));
}

export function straightLineMeters(a, b) {
  if (!a || !b || ![a.lat, a.lng, b.lat, b.lng].every(Number.isFinite)) return Infinity;
  const rad = Math.PI / 180;
  const angle = Math.sin((b.lat - a.lat) * rad / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin((b.lng - a.lng) * rad / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, angle)));
}

export function recommendVisitCities(sites, origin) {
  return groupSitesByCity(sites).filter(group => group.id !== 'unclassified').map(group => {
    const ranked = group.sites.slice().sort((a, b) => straightLineMeters(origin, a) - straightLineMeters(origin, b));
    return { ...group, firstSite: ranked[0], proximityMeters: straightLineMeters(origin, ranked[0]) };
  }).sort((a, b) => b.studentCount - a.studentCount || a.proximityMeters - b.proximityMeters || b.companyCount - a.companyCount || a.name.localeCompare(b.name)).slice(0, 3);
}
