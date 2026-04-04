"use client";

import { usePathname } from "next/navigation";

function AppContainer({ children }) {
  const pathName = usePathname();

  return (
    <div
      className={`relative grid ${pathName === "/login" ? "grid-cols-1" : "grid-cols-[auto_1fr] max-lg:grid-cols-1"} grid-rows-[auto_1fr] max-lg:grid-rows-[auto_1fr_auto] h-screen antialiased text-stone-800 overflow-x-hidden`}
    >
      {children}
    </div>
  );
}

export default AppContainer;
