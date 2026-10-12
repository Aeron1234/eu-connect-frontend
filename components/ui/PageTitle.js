function PageTitle({ Icon = null, title, description, titleAction = null }) {
  return (
    <div>
      <div className="flex max-w-full items-start gap-1 sm:gap-2">
        <h1 className="flex min-w-0 items-center gap-2 text-xl font-bold text-foreground lg:text-3xl">
          {Icon && (
            <Icon className="w-5 h-5 shrink-0 text-primary-emphasis md:w-7 md:h-7" />
          )}
          {title}
        </h1>
        {titleAction && <div className="shrink-0">{titleAction}</div>}
      </div>
      <p className="text-xs sm:text-sm text-foreground-soft mt-1">
        {description}
      </p>
    </div>
  );
}

export default PageTitle;
