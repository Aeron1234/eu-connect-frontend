import AccountProfile from "@/app/_components/AccountProfile";
import { getUserProfile } from "@/app/_services/services";

export const metadata = {
  title: "Account",
  description:
    "View and manage your EU-Connect student profile and account status.",
};

// Static placeholders until wired to real internship/evaluation endpoints.
const studentExtras = {
  internship: {
    company: "Nexus Robotics",
    position: "Full Stack Developer",
    completion: 65,
  },
  history: [
    {
      company: "TechFlow Systems",
      meta: "Frontend Intern • Summer 2023",
      score: "Score: 4.8",
      ratings: [
        { label: "Technical", value: "4.5" },
        { label: "Communication", value: "5.0" },
        { label: "Punctuality", value: "4.0" },
        { label: "Initiative", value: "5.0" },
      ],
    },
  ],
};

async function StudentAccountPage() {
  const userData = await getUserProfile();

  return (
    <AccountProfile
      role="student"
      roleLabel="Student"
      userData={userData || {}}
      extras={studentExtras}
    />
  );
}

export default StudentAccountPage;
