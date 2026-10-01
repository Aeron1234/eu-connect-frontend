import { Phone, MapPin, Briefcase, Building2, IdCard } from "lucide-react";

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 bg-muted/50 rounded-lg p-4">
      <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-emphasis flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground break-words">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function ProfileInfoGrid({ info = {} }) {
  const role = info?.role;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <InfoItem
        icon={Phone}
        label="Contact Number"
        value={info.contact_number}
      />
      <InfoItem icon={MapPin} label="Address" value={info.full_address} />

      {role === "student" && (
        <InfoItem
          icon={Building2}
          label="Currently Interning At"
          value={info.company_name || "Not yet assigned"}
        />
      )}

      {role === "department_head" && (
        <InfoItem
          icon={IdCard}
          label="Employee Number"
          value={info.employee_number}
        />
      )}

      {role === "employer" && (
        <>
          <InfoItem icon={Briefcase} label="Position" value={info.position} />
          <InfoItem
            icon={Building2}
            label="Company Address"
            value={info.company_address}
          />
          <InfoItem
            icon={Phone}
            label="Company Contact"
            value={info.contact_number}
          />
        </>
      )}
    </div>
  );
}

export default ProfileInfoGrid;
