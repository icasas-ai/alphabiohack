"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useUser } from "@/contexts/user-context";
import { ProtectedLoadingScreen } from "@/components/common/protected-loading-screen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: "/auth/login" | "/" | "/dashboard" | "/profile" | "/company" | "/account" | "/bookings" | "/contact" | "/booking" | "/auth/sign-up" | "/auth/sign-up-success" | "/auth/forgot-password" | "/auth/update-password" | "/auth/error" | "/auth/confirm";
}

export function ProtectedRoute({ 
  children, 
  redirectTo = "/auth/login" 
}: ProtectedRouteProps) {
  const { loading, isAuthenticated } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // @ts-expect-error - authenticated route targets are validated by app routes
      router.push(redirectTo);
    }
  }, [loading, isAuthenticated, router, redirectTo]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <ProtectedLoadingScreen />;
  }

  // Si no está autenticado, no renderizar nada (el redirect ya se ejecutó)
  if (!isAuthenticated) {
    return null;
  }

  // Si está autenticado, renderizar el contenido
  return <>{children}</>;
}
