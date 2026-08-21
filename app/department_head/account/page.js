import AccountProfile from "@/app/_components/AccountProfile";
import { getUserProfile } from "@/app/_services/services";

export const metadata = {
  title: "Account",
  description:
    "View and manage your EU-Connect department head profile and account status.",
};

const departmentHeadExtras = {
  roster: {
    title: "Pending Endorsements",
    rows: [
      {
        primary: "Alex Thompson",
        secondary: "Nexus Robotics • 4th Year",
        tag: "For review",
      },
      {
        primary: "Jamie Rivera",
        secondary: "TechFlow Systems • 4th Year",
        tag: "For review",
      },
    ],
  },
};

async function DepartmentHeadAccountPage() {
  const userData = await getUserProfile();

  return (
    <AccountProfile
      role="department_head"
      roleLabel="Department Head"
      userData={userData || {}}
      extras={departmentHeadExtras}
    />
  );
}
export default DepartmentHeadAccountPage;
