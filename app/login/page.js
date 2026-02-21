import { Suspense } from "react";
import LoginForm from "../_components/LoginForm";
import { auth } from "../_services/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Log in",
};

async function page() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="grid items-center justify-items-center h-full">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

export default page;
