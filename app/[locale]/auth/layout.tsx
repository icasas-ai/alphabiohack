import { ThemeStyleBridge } from "@/components/company/theme-style-bridge";
import { PageTransition } from "@/components/common/page-transition"
import { MedicalHeader } from "@/components/layout/header"
import { getCompanyThemeStyle } from "@/lib/company/company-theme";
import { getSiteUrl } from "@/lib/config/site-url";
import { isPublicSiteUnavailableError } from "@/services/company.service";
import { getPublicCompanyProfile } from "@/services/public-profile.service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Authenticate",
  description: "Login or register to your account",
};


export default async function RootLayout({
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
  const publicThemeStyle = getCompanyThemeStyle(company?.landingPageConfig, "public");

  return (
    <div
      className="app-page-gradient min-h-screen flex flex-col bg-secondary"
      style={publicThemeStyle}
    >
      <ThemeStyleBridge style={publicThemeStyle} />
      <MedicalHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <PageTransition className="w-full">
          <div className="w-full">
            {children}
          </div>
        </PageTransition>
      </main>
    </div>
  );
}
