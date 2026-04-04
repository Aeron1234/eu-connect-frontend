function CustomToolTip({ label }) {
  return (
    <span className="px-2 py-1 text-xs shadow-md absolute top-0 left-1/2 -translate-x-[50%] -translate-y-[120%] rounded-sm bg-white text-stone-600 transition-all">
      {label}
    </span>
  );
}

export default CustomToolTip;
