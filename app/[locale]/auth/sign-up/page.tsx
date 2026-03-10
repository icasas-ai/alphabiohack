import { SignUpForm } from "@/components/auth/sign-up-form";
import { getCurrentUser } from "@/lib/auth/session";
import { UserRole } from "@/lib/prisma-browser";
import { redirect } from "next/navigation";

export default async function Page() {
  const { prismaUser } = await getCurrentUser();

  if (prismaUser) {
    if (prismaUser.mustChangePassword) {
      redirect("/auth/update-password");
    }
    if (prismaUser.role.includes(UserRole.FrontDesk)) {
      redirect("/bookings");
    }
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <SignUpForm />
    </div>
  );
}
