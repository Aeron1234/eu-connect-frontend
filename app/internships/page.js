import { redirect } from "next/navigation";
import { getUserSession } from "../_services/services";

async function InternshipPage() {
  const session = await getUserSession();
  if (!session?.user) redirect("/login");

  return <div>Internships</div>;
}

export default InternshipPage;
