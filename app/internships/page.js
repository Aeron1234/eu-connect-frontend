import { redirect } from "next/navigation";
import { auth } from "@/app/_services/auth";

async function InternshipPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <div>Internships</div>;
}

export default InternshipPage;
