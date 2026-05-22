import { redirect } from "next/navigation";
import { getCurrentProfile, getActiveCompany } from "@/lib/auth/session";
import { EmpresaSidebar } from "@/components/capivara/empresa-sidebar";

export default async function EmpresaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  // Cliente PF (sem empresa) vai pro dashboard normal
  if (profile.account_type === "pf") {
    redirect("/dashboard");
  }

  const empresa = await getActiveCompany();
  if (!empresa) {
    redirect("/onboarding/empresa");
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <EmpresaSidebar
        userName={profile.full_name ?? profile.email}
        companyName={empresa.name}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
