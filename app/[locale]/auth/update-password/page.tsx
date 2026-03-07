import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function Page() {
  const { prismaUser } = await getCurrentUser();

  if (!prismaUser) {
    redirect("/auth/login");
  }

  if (!prismaUser.mustChangePassword) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
