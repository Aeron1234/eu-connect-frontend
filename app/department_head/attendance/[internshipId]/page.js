import DepartmentRecordTaskPage from "@/components/internship-records-ui/DepartmentRecordTaskPage";
import { withReadErrorPage } from "@/lib/page-read-error";

export const metadata = { title: "Student Attendance" };
export const dynamic = "force-dynamic";

async function AttendanceRecordPage({ params }) {
  const { internshipId } = await params;
  return await DepartmentRecordTaskPage({ internshipId: decodeURIComponent(internshipId), mode: "attendance" });
}

export default withReadErrorPage(AttendanceRecordPage);
