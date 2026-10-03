import LoginLanding from "@/components/auth-ui/LoginLanding";
import "../_styles/landing.css";

export const metadata = {
  title: "EU-Connect | Your OJT journey, connected",
  description: "EU-Connect is an internship workspace exclusively for the OJT program of Manuel S. Enverga University Foundation - Candelaria Incorporated.",
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  return <LoginLanding initialSignInOpen={params?.signin === "1"} />;
}
