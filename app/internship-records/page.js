import { redirect } from "next/navigation";

export const metadata = {
  title: "Internship Records",
};

async function InternshipRecordsPage({ searchParams }) {
  const sParams = await searchParams;
  const filter = sParams.filter || "all";

  redirect(`/department_head/internship-records?filter=${encodeURIComponent(filter)}`);
}

export default InternshipRecordsPage;
