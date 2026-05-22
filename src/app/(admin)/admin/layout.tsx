import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.account_type !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-paper">
      <AdminSidebar userName={profile.full_name ?? profile.email} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
