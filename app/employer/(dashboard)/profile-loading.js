import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Mail, Phone } from "lucide-react";

function EmployerProfileLoading() {
  return (
    <section className="rounded-xl bg-primary p-5 sm:p-6 shadow-sm overflow-hidden">
      <div className="flex flex-1 flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <Skeleton className="w-12 h-12 flex-shrink-0 rounded-xl bg-white/70" />

          <div className="min-w-0">
            <Skeleton className="h-3 w-16 bg-white/25" />
            <Skeleton className="h-7 sm:h-8 w-48 sm:w-60 mt-1.5 bg-white/25" />
            <Skeleton className="h-4 w-32 mt-1.5 bg-white/25" />

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-white/40" />
                <Skeleton className="h-3 w-40 bg-white/25" />
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 flex-shrink-0 text-white/40" />
                <Skeleton className="h-3 w-32 bg-white/25" />
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 flex-shrink-0 text-white/40" />
                <Skeleton className="h-3 w-24 bg-white/25" />
              </span>
            </div>
          </div>
        </div>

        <div className="flex xs:items-center gap-2 flex-shrink-0 flex-col xs:flex-row">
          <Skeleton className="h-10 w-36 sm:w-40 rounded-md bg-white/70" />
          <Skeleton className="h-10 w-36 sm:w-40 rounded-md bg-white/15 border border-white/20" />
        </div>
      </div>
    </section>
  );
}

export default EmployerProfileLoading;
