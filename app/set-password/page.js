import SetPasswordPageClient from "@/components/auth-ui/SetPasswordPageClient";

export const metadata = {
  title: "Set Password",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

async function SetPasswordPage({ searchParams }) {
  const params = await searchParams;
  const token = typeof params?.token === "string" ? params.token : "";
  return <SetPasswordPageClient token={token} />;
}

export default SetPasswordPage;
