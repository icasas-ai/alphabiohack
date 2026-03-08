export type SeedContentLocale = "en" | "es";

export interface SeedCompanyContent {
  publicDescription: string;
  publicSummary: string;
  publicSpecialty: string;
}

export const DEFAULT_SEED_COMPANY_CONTENT: Record<SeedContentLocale, SeedCompanyContent> = {
  en: {
    publicDescription:
      "A therapist-led practice using AlphaBioHack for bookings, scheduling, and client operations.",
    publicSummary:
      "Book appointments, review office availability, and stay connected with your care team.",
    publicSpecialty: "Therapist Services",
  },
  es: {
    publicDescription:
      "Una práctica liderada por terapeutas que utiliza AlphaBioHack para reservas, agenda y operaciones con pacientes.",
    publicSummary:
      "Reserva citas, revisa la disponibilidad del consultorio y mantente en contacto con tu equipo de cuidado.",
    publicSpecialty: "Servicios de terapia",
  },
};

export function resolveSeedCompanyContent(locale?: string | null): SeedCompanyContent {
  if (!locale) {
    return DEFAULT_SEED_COMPANY_CONTENT.en;
  }

  return locale.toLowerCase().startsWith("es")
    ? DEFAULT_SEED_COMPANY_CONTENT.es
    : DEFAULT_SEED_COMPANY_CONTENT.en;
}
