import { User, GraduationCap, Building2, Shield } from "lucide-react";
import { format } from "date-fns";

export const CARD_ICONS = {
  "Personal Information": User,
  "Academic Overview": GraduationCap,
  "Department Background": GraduationCap,
  "Company Background": Building2,
  "Account Status": Shield,
};

export function raw(v) {
  return v === null || v === undefined ? "" : String(v);
}

export function displayValue(v) {
  return v === "" || v === null || v === undefined ? "—" : v;
}

export function buildName(userData) {
  if (!userData?.first_name && !userData?.last_name) return "";
  return `${userData.first_name ?? ""} ${userData.last_name ?? ""}`.trim();
}

export function buildSubtitle(role, userData) {
  switch (role) {
    case "student":
      return [
        userData.year_level &&
          `${userData.year_level} ${userData.course ?? ""} Student`,
        userData.student_number && `Student ID: ${userData.student_number}`,
      ]
        .filter(Boolean)
        .join(" • ");
    case "employer":
      return [userData.position, userData.company_name]
        .filter(Boolean)
        .join(" • ");
    case "department_head":
      return [
        "Department Head",
        userData.department_name ?? userData.department_code,
      ]
        .filter(Boolean)
        .join(" • ");
    case "admin":
      return "System Administrator • EU-Connect";
    default:
      return "";
  }
}

// Every field carries:
//   key      — the exact key updateUserInfo's req.body expects (omit for read-only fields)
//   editable — false locks the field even while the page is in edit mode, and
//              keeps it out of the save payload entirely
export function buildCards(role, userData) {
  const personalCard = {
    title: "Personal Information",
    fields: [
      {
        label: "Email Address",
        key: "email",
        value: raw(userData.email),
        editable: true,
      },
      {
        label: "Contact Number",
        key: "contact_number",
        value: raw(userData.contact_number),
        editable: true,
      },
      {
        label: "Full Address",
        key: "full_address",
        value: raw(userData.full_address),
        editable: true,
      },
    ],
  };

  switch (role) {
    case "student":
      return [
        personalCard,
        {
          title: "Academic Overview",
          fields: [
            { label: "Course", value: raw(userData.course), editable: false },
            {
              label: "Department",
              value: raw(
                userData.department_name
                  ? `${userData.department_name} (${userData.department_code})`
                  : userData.department_code,
              ),
              editable: false,
            },
            {
              label: "Student Number",
              value: raw(userData.student_number),
              editable: false,
            },
            {
              label: "Year Level",
              value: raw(userData.year_level),
              editable: false,
            },
          ],
        },
      ];
    case "employer":
      return [
        personalCard,
        {
          title: "Company Background",
          fields: [
            {
              label: "Company Name",
              key: "company_name",
              value: raw(userData.company_name),
              editable: true,
            },
            {
              label: "Position",
              key: "position",
              value: raw(userData.position),
              editable: true,
            },
            {
              label: "Company Contact",
              key: "company_contact_number",
              value: raw(userData.company_contact_number),
              editable: true,
            },
            {
              label: "Company Address",
              key: "company_address",
              value: raw(userData.company_address),
              editable: true,
            },
          ],
        },
      ];
    case "department_head":
      return [
        personalCard,
        {
          title: "Department Background",
          fields: [
            {
              label: "Department",
              value: raw(
                userData.department_name
                  ? `${userData.department_name} (${userData.department_code})`
                  : userData.department_code,
              ),
              editable: false, // admin-assigned — backend deliberately excludes this
            },
            {
              label: "Employee Number",
              key: "employee_number",
              value: raw(userData.employee_number),
              editable: true,
            },
          ],
        },
      ];
    case "admin":
      return [
        personalCard,
        {
          title: "Account Status",
          fields: [
            { label: "Role", value: "Administrator", editable: false },
            {
              label: "Status",
              value: userData.status
                ? userData.status.charAt(0).toUpperCase() +
                  userData.status.slice(1)
                : "",
              editable: false,
            },
            {
              label: "Member Since",
              value: userData.created_at
                ? format(new Date(userData.created_at), "MMMM yyyy")
                : "",
              editable: false,
            },
          ],
        },
      ];
    default:
      return [personalCard];
  }
}
