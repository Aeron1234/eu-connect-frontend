"use client";


export default function EvaluationCategory({ children, className }) {
  return (
    <h4
      className={`flex-1 py-2 px-4 bg-muted font-semibold ${className} rounded-t-sm`}
    >
      {children}
    </h4>
  );
}
