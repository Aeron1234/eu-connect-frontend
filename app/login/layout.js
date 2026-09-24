import { redirect } from "next/navigation";
import { getUserSession } from "../_services/auth";

async function LoginLayout({ children }) {
  const session = await getUserSession();
  const user = session?.user;
  const role = session?.user?.role;
  if (user && role) redirect(`/${role}`);

  return children;
}

export default LoginLayout;
