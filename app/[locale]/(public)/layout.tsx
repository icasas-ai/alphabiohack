import { MedicalHeader } from "@/components/layout/header"
import { getSiteUrl } from "@/lib/config/site-url";
import { getPublicCompanyProfile } from "@/services/public-profile.service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "MyAlphaPulse",
};


export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const company = await getPublicCompanyProfile();
  const headerContact = company
    ? {
        name: company.name,
        logo: company.logo,
        headerLogo: company.headerLogo,
        email: company.publicEmail,
        telefono: company.publicPhone,
      }
    : null;

  return (
    <div className="app-page-gradient min-h-screen flex flex-col bg-secondary">
      <MedicalHeader initialPublicContact={headerContact} />
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>
    </div>
  );
}
