import { LogOut } from "lucide-react";

import { logout } from "../_services/student-actions";

function SignoutButton({ screenSize }) {
  return (
    <form action={logout}>
      <button className="flex w-full items-center gap-2 px-5 py-2 max-md:px-2 hover:bg-primary-600 transition-colors rounded-sm">
        <LogOut className="h-5 w-5" />
        {screenSize > 1100 && "Sign out"}
      </button>
    </form>
  );
}

export default SignoutButton;
