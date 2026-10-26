import { formatEventDateRange } from "../../lib/announcement-event-dates.mjs";

function dateRange(start, end, day) {
  return {
    rangeLabel: formatEventDateRange(start, end),
    rangePosition: start === end ? "single" : day === start ? "start" : day === end ? "end" : "middle",
  };
}

// Project the authorized month response onto one calendar day using date-only keys.
// Announcement and schedule endpoints are inclusive; missing announcement end
// means one day. Visibility is enforced by the API, not by this projection.
export function entriesFor(data, day) {
  const result = [];
  for (const item of data.announcements ?? []) {
    const end = item.event_end_date || item.event_date;
    if (item.event_date <= day && end >= day) {
      result.push({
        kind: "announcement",
        key: `a-${item.id}`,
        title: item.title,
        detail: item.content,
        href: `/announcements?announcement=${encodeURIComponent(item.id)}`,
        subtitle: item.category,
        ...dateRange(item.event_date, end, day),
      });
    }
  }
  for (const item of data.schedules ?? []) {
    if (item.starts_on <= day && item.ends_on >= day) {
      result.push({
        kind: "schedule",
        key: `s-${item.id}`,
        title: item.title,
        detail: item.description,
        subtitle: item.department_id == null ? "School-wide" : "Department",
        source: item,
        ...dateRange(item.starts_on, item.ends_on, day),
      });
    }
  }
  const internship = data.internship;
  if (internship?.date_started <= day && internship?.date_ended >= day) {
    result.push({ kind: "internship", key: "internship", title: internship.company_name || "Ongoing internship", subtitle: day === internship.date_started ? "First day" : day === internship.date_ended ? "Last day" : "Internship day", href: "/student/internship-record" });
  }
  for (const item of data.todos ?? []) {
    if (item.todo_date === day) result.push({ kind: "todo", key: `t-${item.id}`, title: item.title, done: !!item.is_done, source: item });
  }
  return result;
}
