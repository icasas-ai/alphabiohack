import { PageTransition } from "@/components/common/page-transition"
import { MedicalHeader } from "@/components/layout/header"
import { getSiteUrl } from "@/lib/config/site-url";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Authenticate",
  description: "Login or register to your account",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-page-gradient min-h-screen flex flex-col bg-secondary">
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
