function PageContainer({ children, className = "" }) {
  return (
    <div className={`h-full w-full flex flex-col gap-4 text-sm ${className}`}>
      {children}
    </div>
  );
}

export default PageContainer;
