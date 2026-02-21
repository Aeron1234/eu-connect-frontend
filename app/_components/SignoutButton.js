import { LogOut } from "lucide-react";

import { logout } from "../_services/actions";

function SignoutButton({ role }) {
  return (
    <form action={logout}>
      <button className="flex w-full items-center gap-2 px-5 py-2 hover:bg-stone-100 hover:text-primary-500 transition-colors">
        <LogOut className="h-5 w-5" />
        {role && "Sign out"}
      </button>
    </form>
  );
}

export default SignoutButton;
