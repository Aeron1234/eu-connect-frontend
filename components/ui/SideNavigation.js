"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { accountProfileOptions } from "@/lib/cache/account-profile-queries";
import SideNavigationList from "./SideNavigationList";

export default function SideNavigation() {
  const { user } = useUser();
  const profileQuery = useQuery({
    ...accountProfileOptions(user?.id),
    enabled: Boolean(user?.id),
  });
  const profile = profileQuery.data;
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");

  return (
    <SideNavigationList
      fullName={fullName}
      avatar={profile?.avatar || null}
    />
  );
}
