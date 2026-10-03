function TitleButton({ children }) {
  return (
    <div className="inline-flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition w-full sm:w-auto">
      {children}
    </div>
  );
}

export default TitleButton;
