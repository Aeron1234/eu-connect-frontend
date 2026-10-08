import CalendarBoard from "@/components/calendar-ui/CalendarBoard";
import { getCalendarMonth, getCalendarSchedule } from "@/lib/server-actions/calendar-actions";

export const metadata = { title: "Calendar" };
export const dynamic = "force-dynamic";

function todayManila() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

export default async function CalendarPage({ searchParams }) {
  const params = await searchParams;
  let selected = todayManila();
  if (params?.schedule && /^\d+$/.test(String(params.schedule))) {
    const schedule = await getCalendarSchedule(params.schedule);
    if (schedule.starts_on) selected = schedule.starts_on;
  } else if (typeof params?.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
    const parsed = new Date(`${params.date}T00:00:00Z`);
    if (!Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === params.date) selected = params.date;
  }
  const month = selected.slice(0, 7);
  const initialData = await getCalendarMonth(month);
  return <CalendarBoard key={selected} initialDate={selected} initialData={initialData} />;
}
