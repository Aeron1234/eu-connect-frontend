// Filter individual interns before grouping/counting, keeping mixed-department sites accurate.
// Region and department IDs are normalized because API and Select values can differ in type.
export function filterMapSites(companySites, { regionId = null, departmentId = "", query = "" } = {}) {
  const q = query.trim().toLowerCase();
  return companySites
    .filter(site => !regionId || String(site.region_id) === String(regionId))
    .map(site => ({ ...site, interns: site.interns.filter(intern =>
      (!departmentId || String(intern.departmentId) === String(departmentId)) &&
      (!q || [intern.name, intern.course, intern.courseShortName, site.company]
        .some(value => value?.toLowerCase().includes(q)))
    ) }))
    .filter(site => site.interns.length > 0);
}
