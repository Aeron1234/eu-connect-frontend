import { redirect } from "next/navigation";
import { departmentRecordDestination } from "@/lib/department-record-navigation";

export default async function LegacyRecordDetail({ params, searchParams }) {
  const { internshipId } = await params;
  redirect(departmentRecordDestination(internshipId, await searchParams));
}
