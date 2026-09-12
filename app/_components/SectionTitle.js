function SectionTitle({ Icon = null, title, description = "" }) {
  return (
    <div className="min-w-0 flex-1 pr-2">
      <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold lg:text-base">
        {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
        {title}
      </h2>
      {description && (
        <p className="text-xs text-stone-600 line-clamp-2 lg:text-sm">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionTitle;
