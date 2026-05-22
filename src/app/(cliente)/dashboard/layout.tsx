import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { AppSidebar } from "@/components/capivara/app-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  // PJ admin/member → redireciona pra area da empresa
  if (profile.account_type === "pj_admin" || profile.account_type === "pj_member") {
    redirect("/empresa");
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <AppSidebar userName={profile.full_name ?? profile.email} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
