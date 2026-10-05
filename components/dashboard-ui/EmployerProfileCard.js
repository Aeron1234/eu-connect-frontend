import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Briefcase,
  Users,
  BriefcaseBusiness,
} from "lucide-react";
import Link from "next/link";

function EmployerProfileCard({ profile = {} }) {
  return (
    <section className="brand-orbit rounded-xl bg-primary text-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-1 flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-card flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-emphasis" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-primary-foreground/70">
              Employer
            </p>
            <h2 className="text-xl sm:text-2xl font-bold mt-0.5">
              {profile.first_name} {profile.last_name}
            </h2>
            {profile?.position && (
              <p className="text-sm text-primary-foreground/80 mt-0.5">
                {profile.position}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-primary-foreground/75">
              {profile?.company_address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  {profile.company_address}
                </span>
              )}
              {profile?.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  {profile.email}
                </span>
              )}
              {profile?.company_contact_number && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  {profile.company_contact_number}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex xs:items-center gap-2 flex-shrink-0 flex-col xs:flex-row">
          <Link
            href="/internships"
            className="flex items-center gap-2 px-3 py-2.5 xl:px-5 rounded-md text-sm font-semibold transition-colors bg-white text-primary-500 hover:brightness-95 whitespace-nowrap"
          >
            <Briefcase className="w-4 h-4" />
            Manage Jobs
          </Link>
          <Link
            href="/users"
            className="flex items-center gap-2 px-3 py-2.5 xl:px-5 rounded-md text-sm font-semibold transition-colors text-white bg-white/10 border border-white/20 hover:bg-white/20 whitespace-nowrap"
          >
            <Users className="w-4 h-4" />
            Find Interns
          </Link>
        </div>
      </div>
    </section>
  );
}

export default EmployerProfileCard;
