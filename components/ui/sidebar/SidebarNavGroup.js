"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import NavLink from "./SidebarNavLink";

export default function SidebarNavGroup({ item, pathName, isCollapsed, onClick }) {
  const hasActiveChild = item.children.some((child) => pathName.startsWith(child.href));
  const [open, setOpen] = useState(hasActiveChild);
  return <div>
    <button type="button" aria-expanded={open} aria-label={`${item.name} menu`} title={isCollapsed ? item.name : undefined} onClick={() => setOpen((current) => !current)} className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${hasActiveChild ? "bg-white/10 text-white" : ""} ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}>
      {item.icon}<span className={isCollapsed ? "lg:hidden" : ""}>{item.name}</span><ChevronDown className={`ml-auto size-4 transition-transform ${open ? "rotate-180" : ""} ${isCollapsed ? "lg:hidden" : ""}`} />
    </button>
    {open && <ul className={`ml-3 mt-1 space-y-1 border-l border-white/20 pl-2 ${isCollapsed ? "lg:ml-0 lg:border-0 lg:pl-0" : ""}`}>{item.children.map((child) => <li key={child.href}><NavLink {...child} pathName={pathName} isCollapsed={isCollapsed} onClick={onClick} /></li>)}</ul>}
  </div>;
}
