import AccountProfile from "@/app/_components/AccountProfile";
import { getUserProfile } from "@/app/_services/services";

export const metadata = {
  title: "Account",
  description:
    "View and manage your EU-Connect employer profile and account status.",
};

const employerExtras = {
  roster: {
    title: "Current Interns",
    rows: [
      {
        primary: "Alex Thompson",
        secondary: "Full Stack Developer • CCS",
        tag: "65% done",
      },
      {
        primary: "Jamie Rivera",
        secondary: "QA Analyst • CCS",
        tag: "40% done",
      },
    ],
  },
};

async function EmployerAccountPage() {
  const userData = await getUserProfile();

  console.log(userData);
  return (
    <AccountProfile
      role="employer"
      roleLabel="Employer"
      userData={userData || {}}
      extras={employerExtras}
    />
  );
}

export default EmployerAccountPage;
