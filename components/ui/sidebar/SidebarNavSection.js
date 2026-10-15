import NavLink from "./SidebarNavLink";

export default function SidebarNavSection({
  label,
  routes,
  divided,
  isCollapsed,
  pathName,
  onClick,
}) {
  return (
    <section
      aria-label={label}
      className={`w-full ${divided ? "mt-2 border-t border-white/20 pt-2" : ""}`}
    >
      <h3
        className={`px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60 ${isCollapsed ? "lg:hidden" : ""}`}
      >
        {label}
      </h3>
      <ul className="flex flex-col gap-1">
        {routes.map((item) => (
          <li key={item.href}>
            <NavLink
              scroll={false}
              href={item.href}
              name={item.name}
              icon={item.icon}
              pathName={pathName}
              isCollapsed={isCollapsed}
              onClick={onClick}
              exact={item.exact}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
