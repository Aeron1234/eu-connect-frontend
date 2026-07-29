async function PageTitle({
  children = null,
  title,
  name = "",
  description = "",
  icon = null,
}) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h1
          className={`${icon ? "flex items-center gap-2" : ""} text-xl self-start font-bold text-stone-800 max-md:text-lg max-xs:text-base`}
        >
          {icon && <span className="text-primary-500">{icon}</span>}
          {name ? (
            <span>
              {title}, {name}!
            </span>
          ) : (
            <span>{title}</span>
          )}
        </h1>
        {description && <span className="text-stone-600">{description}</span>}
      </div>

      {children}
    </header>
  );
}

export default PageTitle;
