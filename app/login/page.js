import LoginForm from "../_components/LoginForm";
import { auth } from "../_services/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Log in",
};

async function page() {
  const session = await auth();
  if (session?.user) redirect("/");

  return <LoginForm />;
}

export default page;
