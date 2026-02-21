import { redirect } from "next/navigation";
import { auth } from "./_services/auth";

async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;

  redirect(`/${role}`);
}

export default HomePage;
