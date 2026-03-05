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
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>
    </div>
  );
}
