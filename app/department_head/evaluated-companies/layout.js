import { notFound } from "next/navigation";
import { getUserSession } from "@/lib/server-actions/auth";

export default async function EvaluatedCompaniesLayout({ children }) {
  const session = await getUserSession();
  if (session?.user?.role !== "department_head" || session.user.department_code === "REG") notFound();
  return children;
}
