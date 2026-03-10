import { PageTransition } from "@/components/common/page-transition"
import { MedicalHeader } from "@/components/layout/header"
import { MedicalFooter } from "@/components/layout/footer"
import { getSiteUrl } from "@/lib/config/site-url";
import { isPublicSiteUnavailableError } from "@/services/company.service";
import { getPublicCompanyProfile } from "@/services/public-profile.service";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "MyAlphaPulse",
};


export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const company = await getPublicCompanyProfile().catch((error) => {
    if (isPublicSiteUnavailableError(error)) {
      return null;
    }

    throw error;
  });
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
    <div className="app-page-gradient min-h-screen flex flex-col bg-background text-foreground">
      <MedicalHeader initialPublicContact={headerContact} />
      <main className="flex-1">
        <PageTransition className="flex min-h-full flex-col">
          <div className="flex min-h-full flex-col">
            {children}
          </div>
        </PageTransition>
      </main>
      <MedicalFooter />
    </div>
  );
}
