"use client";
import { LogOut } from "lucide-react";

import { logout } from "../_services/student-actions";
import { useUser } from "@/contexts/UserContext";

function SignoutButton({ screenSize }) {
  const { resetUser } = useUser();

  function handleAction() {
    resetUser();
    logout();
  }
  return (
    <form action={handleAction}>
      <button className="flex w-full items-center gap-2 px-5 py-2 hover:bg-white hover:text-primary-500 transition-colors rounded-sm font-normal">
        <LogOut className="h-5 w-5" />
        Sign out
      </button>
    </form>
  );
}

export default SignoutButton;
