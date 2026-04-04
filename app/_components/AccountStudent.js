import PageContainer from "./PageContainer";
import PageTitle from "./PageTitle";
import AccountInternshipRecords from "./AccountInternshipRecords";
import AccountHeader from "./AccountHeader";
import AccountPersonalInfo from "./AccountPersonalInfo";
import { Button } from "@base-ui/react";
import {
  Briefcase,
  Building,
  GraduationCap,
  Mail,
  MapPin,
  Pencil,
  Phone,
  User,
} from "lucide-react";
import TriggerButton from "./TriggerButton";

function AccountStudent({ userProfile }) {
  return (
    <PageContainer>
      <PageTitle
        title={`Account`}
        description="Manage your profile information"
      >
        {/* <TriggerButton
          icon={<SquarePen strokeWidth={3} size={16} color="#fff" />}
          label={"Edit"}
          textColor={"text-white"}
          bgColor={"bg-primary-500 rounded-sm"}
        /> */}
      </PageTitle>
      {/* <AccountHeader
        fullName={"Roronoa Zoro"}
        department={"Computer Science"}
        email={"roronoazoro@email.com"}
      /> */}

      <section className="bg-white shadow-sm rounded-sm p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 text-primary-500 flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0 ">
          {userProfile.first_name[0]}
          {userProfile.last_name[0]}
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            {userProfile.first_name} {userProfile.last_name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {userProfile.student_number} · {userProfile.course}
          </p>
          <p className="text-xs text-muted-foreground">MSEUFCI</p>
        </div>
      </section>

      <section className="bg-white shadow-sm rounded-sm p-4 sm:p-5 ">
        <div className="flex justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <User className="w-4 h-4 text-primary-500" /> Personal Information
          </h3>

          <TriggerButton icon={<Pencil size={14} className="h-fit p-0" />} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Info label="First Name" info={userProfile.first_name} />
          <Info label="Last Name" info={userProfile.last_name} />
          <Info
            label="Email"
            info={userProfile.email}
            icon={<Mail size={16} color="#a8a29e" />}
          />
          <Info
            label="Contact No."
            info="09090909090"
            icon={<Phone size={16} color="#a8a29e" />}
          />
          <Info
            label="Address"
            info={userProfile.full_address}
            icon={<MapPin size={16} color="#a8a29e" />}
          />
        </div>
      </section>

      <section className="bg-white shadow-sm rounded-sm p-4 sm:p-5 ">
        <div className="flex justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-primary-500" /> Academic
            Information
          </h3>

          <TriggerButton icon={<Pencil size={14} className="h-fit p-0" />} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Info label="First Name" info={userProfile.first_name} />
          <Info label="Last Name" info={userProfile.last_name} />
          <Info
            label="Email"
            info="roronoazoro@email.com"
            icon={<Mail size={16} color="#a8a29e" />}
          />
          <Info
            label="Contact No."
            info="09090909090"
            icon={<Phone size={16} color="#a8a29e" />}
          />
          <Info
            label="Address"
            info={userProfile.full_address}
            icon={<MapPin size={16} color="#a8a29e" />}
          />
        </div>
      </section>

      <section className="bg-white shadow-sm rounded-sm p-4 sm:px-5">
        <div className="flex justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Building className="w-4 h-4 text-primary-500" /> Current Internship
          </h3>

          <TriggerButton icon={<Pencil size={14} className="h-fit p-0" />} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Info label="First Name" info={userProfile.first_name} />
          <Info label="Last Name" info={userProfile.last_name} />
          <Info
            label="Email"
            info="roronoazoro@email.com"
            icon={<Mail size={16} color="#a8a29e" />}
          />
          <Info
            label="Contact No."
            info="09090909090"
            icon={<Phone size={16} color="#a8a29e" />}
          />
        </div>
      </section>

      <section className="bg-white shadow-sm rounded-sm p-4 sm:px-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-1.5">
          <Briefcase className="w-4 h-4 text-primary-500" /> Internship Records
        </h3>

        <ul className="flex-1 flex flex-col gap-2 wrap-break-word text-xs">
          <AccountInternshipRecords />
        </ul>
      </section>

      {/* <section className="flex-1 flex flex-col gap-2 py-4">
        <h2 className="text-base font-semibold px-4">Internship Records</h2>

        <AccountInternshipRecords />
      </section> */}
    </PageContainer>
  );
}

function Info({ label, info, icon = null }) {
  return (
    <div className="flex flex-col">
      <span className="text-stone-500 text-xs">{label}</span>
      {icon ? (
        <p className="flex gap-1 items-center">
          <span>{icon}</span> {info}
        </p>
      ) : (
        <span>{info}</span>
      )}
    </div>
  );
}

export default AccountStudent;
