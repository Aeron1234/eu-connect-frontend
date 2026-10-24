"use client";
import ErrorUI from "@/components/ui/ErrorUI";
export default function Error({ error, reset }) { return <div className="p-4 sm:p-6"><ErrorUI error={error} reset={reset} /></div>; }
