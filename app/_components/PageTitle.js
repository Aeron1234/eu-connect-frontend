function PageTitle({ Icon = null, title, description }) {
  return (
    <div>
      <h1 className="text-xl lg:text-3xl font-bold text-stone-800 flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 md:w-7 md:h-7 text-primary-500" />}
        {title}
      </h1>
      <p className="text-xs sm:text-sm text-stone-600 mt-1">{description}</p>
    </div>
  );
}

export default PageTitle;
