import Link from "next/link";
import Logo from "../Logo";

export default function SidebarBrand({ homeHref, closeMobile, isCollapsed }) {
  return (
    <Link
      href={homeHref}
      scroll={false}
      onClick={closeMobile}
      className={`group flex h-16 w-full shrink-0 items-center gap-3 border-b border-white/25 ${isCollapsed ? "lg:justify-center" : ""}`}
    >
      <div className="shrink-0 rounded-full bg-white p-0.5 transition-transform group-hover:scale-105">
        <Logo small />
      </div>
      <h2
        className={`text-sm font-bold tracking-wide ${isCollapsed ? "lg:hidden" : ""}`}
      >
        EU-Connect
      </h2>
    </Link>
  );
}
