export const companyAnalyticsGuide={
  id:'company-analytics',title:'Compare internship company placements',href:'/company-analytics',linkText:'Open Company Analytics',hideForRegistrar:true,
  summary:'Rank companies using distinct students with confirmed placements, with a separate zero-match directory.',
  steps:[
    'Admins see all departments and can filter department, dependent course, academic year, term and internship start-date range. Regular department heads see only their current department, with course/year/term/date filters. Registrar, students and employers cannot open company popularity analytics.',
    'Choose filters and select Apply filters; Reset returns to all available dates. Displayed period, department, course and snapshot identify the report being shown. Dates are inclusive and use saved internship start dates, not application dates or attendance. Academic years match the existing semester-aware SIPP reporting rules.',
    'Popularity counts each student once per normalized company name across ongoing/finished nondeleted placements. Pending/rejected/deleted records, deleted student accounts and unlinked manual alumni entries are not popularity counts. Case/spacing variants and same-name branches are combined; different aliases stay separate because there is no company master ID.',
    'Read the most/least popular lists and ranked comparison chart. Ties share a ranking; least popular means at least one matching student. Distribution uses distinct student/company pairs, which can exceed the number of distinct students when a student worked at different companies. The detailed report uses the same data as cards/charts. Ongoing takes precedence if a student has both ongoing and finished records at the same company in the selected period.',
    'Zero-placement companies are listed separately: these are names from accessible confirmed placement history and the existing alumni company directory with no matching confirmed students in the selected period/course. They are not rejected applications or open vacancies. Undated records appear only when no date/year filter excludes them. Monthly trends show months with recorded starts; a pair can recur in different months, so monthly values are not additive.',
    'Use the horizontally scrolling detailed table on mobile and Previous/Next for ten companies at a time. CSV and Print / Save PDF export the full filtered ranked and zero-match tables, not just the current page. Print uses the existing print library; use the browser PDF option to save a copy. No private student records are exported.',
    'Cards stack on phones; chart labels shorten with full names in tap/hover tooltips, and filters wrap. Retry a failed read or clear invalid filters. An empty report is distinct from a server error.'
  ]
};
export const registrarDashboardGuide={
  id:'registrar-dashboard',onlyRegistrar:true,title:'Review Registrar reporting coverage',href:'/department_head',linkText:'Open Registrar Dashboard',
  summary:'A dedicated overview of the SIPP reports and placement data already available to the Registrar.',
  steps:[
    'Open Dashboard from the sidebar. Only the current Registrar department head can use this dashboard. It does not grant access to company popularity, private attendance, evaluation analytics or document verification queues.',
    'Choose an academic year and Apply filters; the default/reset uses the current academic year, matching Annex D. Annex C total/draft/submitted counts use the actual saved report statuses. Drafts are work to complete, not returned/verified records. Confirmed student counts and the department/course table summarize the Annex D placement population.',
    'Select a report card to open SIPP Reports with the academic year, Annex C/Annex D tab and draft/submitted filter preserved. Use the existing report forms, lists, preview and export there. The placement coverage card opens Annex D; it is not a student account directory.',
    'Read course/department coverage and the Annex C submission trend based on actual submitted_at months. Recent reports show their saved status; open Reports to work on drafts or preview submitted reports. There are no fabricated missing-document or correction statistics.',
    'Use Refresh to obtain a new consistent snapshot. Mobile cards/charts stack, controls wrap and tables scroll inside their container. Loading skeletons, empty states and Retry distinguish waiting, no data and failed reads.'
  ]
};
