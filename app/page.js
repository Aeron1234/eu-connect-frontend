import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/server-actions/auth";

export default async function HomePage() {
  const session = await getUserSession();
  const role = session?.user?.role;

  if (
    session?.user &&
    ["student", "employer", "department_head", "admin"].includes(role)
  ) {
    redirect(`/${role}`);
  }

  redirect("/login");
}
