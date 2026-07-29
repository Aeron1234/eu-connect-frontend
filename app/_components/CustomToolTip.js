function CustomToolTip({ label, position = "" }) {
  return (
    <span className="absolute left-1/2 -translate-x-[50%] top-full translate-y-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-hover:delay-500 transition-all duration-200 rounded bg-stone-800 text-white text-[11px] px-2 py-1 shadow-md z-50 pointer-events-none whitespace-nowrap">
      {label}
    </span>
  );
}

export default CustomToolTip;
