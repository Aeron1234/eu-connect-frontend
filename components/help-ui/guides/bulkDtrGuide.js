export function bulkDtrGuide(role) {
  const scope = role === 'admin' ? 'Admins see all ongoing interns. Use Departments, then Courses; changing department resets the course filter.' : role === 'department_head' ? 'Department heads see ongoing interns in their own department and can filter by course. Registrar department heads cannot open or use this tool.' : 'Employers see only students assigned to them as supervisor on an ongoing internship. Other employers’ interns are never included.';
  return {
    id: 'bulk-dtr-locations', title: 'Assign individual or bulk DTR locations', hideForRegistrar: true,
    summary: 'Set one attendance location for one or many ongoing interns, with scoped map pins and notifications.',
    href: '/dtr-locations', linkText: 'Open DTR Locations',
    steps: [scope,
      'Search by student name. Select one student or several; Select all selects only the current table page. Selections remain across searches, filters and pagination. Review avatars, names and the selected count; remove a student or Clear all. Each save supports up to 100 internship assignments.',
      'Search inside the map or click to preview a maroon pin. Confirm the address or shorten it to 255 characters, set a whole-number radius between 20 and 2,000 meters (default 150), and optionally add a location note. Review assignment shows the exact location and selected count before saving.',
      'Saving replaces custom DTR locations for selected ongoing internships. It also overrides the company default for students without a custom location. Clock-in and clock-out use the same attendance checks as an individual assignment. Company coordinates, internship dates and existing attendance records are unchanged.',
      'Blue pins group saved custom assignments at the same coordinates within your current filters. Open a pin to see authorized student names, avatars and radii. Company-default locations are identified in the table. Changing a student’s assignment moves them to the corresponding pin after refresh.',
      'Each successfully changed student receives a location notification with attendance instructions. Admin and department-head changes also send one grouped notification per assigned supervising employer. Students without supervisors still receive their own notification. Identical assignments are unchanged and do not send duplicate notices.',
      'Read the results after saving. Students whose internship or access changed are identified as not assigned and stay selected. Unexpected database failures roll back the write set. If confirmation times out, refresh the table and map before retrying because the save may already have completed. Use Refresh or Retry for failed reads.'
    ]
  };
}
