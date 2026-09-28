import { redirect } from "next/navigation";
import { getUserSession } from "../../lib/server-actions/auth";

async function LoginLayout({ children }) {
  const session = await getUserSession();
  const user = session?.user;
  if (user) redirect(`/${user.role}`);

  return children;
}

export default LoginLayout;
