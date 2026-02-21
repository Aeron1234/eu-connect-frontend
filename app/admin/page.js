import { auth } from "@/app/_services/auth";
import { notFound } from "next/navigation";

async function AdminPage() {
  const session = await auth();
  if (!session?.user) return notFound();

  const role = session.user.role;
  if (role !== "admin") return notFound();

  return <div>Admin Page</div>;
}

export default AdminPage;
