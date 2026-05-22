import { SiteHeader } from "@/components/capivara/site-header";

export default function ConsultarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      {children}
    </div>
  );
}
