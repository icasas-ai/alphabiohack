/**
 * Configuración de rutas públicas y protegidas
 */

// Rutas que no requieren autenticación
export const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/services",
  "/blog",
  "/booking",
  "/auth/login",
  "/auth/sign-up",
  "/auth/sign-up-success",
  "/auth/forgot-password",
  "/auth/update-password",
  "/auth/error",
  "/auth/confirm",
  "/es-MX",
  
] as const;

// Rutas que requieren autenticación
export const PROTECTED_ROUTES = [
  "/protected",
  "/dashboard",
  "/profile",
  "/company",
  "/account",
  "/bookings",
  "/availability",
  "/locations",
  "/specialties",
  "/personnel",
] as const;

// Rutas de API públicas
export const PUBLIC_API_ROUTES = ["/api/auth", "/api/health"] as const;

// Rutas estáticas que deben ser excluidas del middleware
export const STATIC_ROUTES = [
  "/_next/static",
  "/_next/image",
  "/favicon.ico",
  "/images",
  "/api",
] as const;

// Extensiones de archivos estáticos
export const STATIC_FILE_EXTENSIONS = [
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".css",
  ".js",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
] as const;

/**
 * Verifica si una ruta es pública
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

/**
 * Verifica si una ruta es protegida
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Verifica si una ruta es estática
 */
export function isStaticRoute(pathname: string): boolean {
  // Verificar rutas estáticas
  if (STATIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return true;
  }

  // Verificar extensiones de archivos estáticos
  return STATIC_FILE_EXTENSIONS.some((ext) => pathname.endsWith(ext));
}

/**
 * Verifica si una ruta debe ser procesada por el middleware
 */
export function shouldProcessRoute(pathname: string): boolean {
  return (
    !isPublicRoute(pathname) &&
    !isStaticRoute(pathname) &&
    !pathname.startsWith("/api")
  );
}
