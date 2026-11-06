import { redirect } from "next/navigation";

export default async function LegacyRecordDetail({ params }) {
  const { internshipId } = await params;
  redirect(`/department_head/internship-records/${encodeURIComponent(internshipId)}`);
}
