import { redirect } from "next/navigation";
import { getUserSession } from "../../lib/server-actions/auth";
import ClearQueryCache from "@/lib/cache/ClearQueryCache";

async function LoginLayout({ children }) {
  const session = await getUserSession();
  const user = session?.user;
  if (user && ["student", "employer", "department_head", "admin"].includes(user.role)) {
    redirect(`/${user.role}`);
  }

  return <ClearQueryCache>{children}</ClearQueryCache>;
}

export default LoginLayout;
