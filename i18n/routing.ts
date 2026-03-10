import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en-US", "es-MX"],
  // Used when no locale matches
  defaultLocale: "en-US",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/dashboard": {
      "es-MX": "/tablero",
    },
    "/profile": {
      "es-MX": "/perfil",
    },
    "/bookings": {
      "es-MX": "/reservas",
    },
    "/contact": {
      "es-MX": "/contacto",
    },
    "/booking": {
      "es-MX": "/reservar",
    },
    "/auth/login": {
      "es-MX": "/auth/iniciar-sesion",
    },
    "/auth/sign-up": {
      "es-MX": "/auth/registrarme",
    },
    "/auth/sign-up-success": {
      "es-MX": "/auth/registro-completado",
    },
    "/auth/forgot-password": {
      "es-MX": "/auth/recuperar-contrasena",
    },
    "/auth/update-password": {
      "es-MX": "/auth/actualizar-contrasena",
    },
    "/auth/error": {
      "es-MX": "/auth/error",
    },
    "/auth/confirm": {
      "es-MX": "/auth/confirmado",
    },
  },
  localeCookie:
    process.env.NEXT_PUBLIC_USE_CASE === "locale-cookie-false"
      ? false
      : {
          // 200 days
          maxAge: 200 * 24 * 60 * 60,
        },
});
