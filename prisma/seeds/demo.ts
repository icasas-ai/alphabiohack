import { hashPassword } from "@/lib/auth/password";
import { serializeLandingPageConfig } from "@/lib/company/landing-page-config";
import {
  BookingStatus,
  BookingType,
  CompanyMembershipRole,
  UserRole,
} from "@/lib/prisma-client";
import { prisma } from "@/lib/prisma";
import { PST_TZ, combineDateAndTimeToUtc } from "@/lib/utils/timezone";

const DEMO_PASSWORD = "HarborDemo123!";
const COMPANY_SLUG = "harbor-balance-wellness";

type DemoUserSeed = {
  key: string;
  email: string;
  firstname: string;
  lastname: string;
  telefono?: string;
  informacionPublica?: string;
  especialidad?: string;
  summary?: string;
  role: UserRole[];
  membershipRole: CompanyMembershipRole;
  managedByKey?: string;
};

type DemoLocationSeed = {
  key: string;
  title: string;
  address: string;
  description: string;
  lat?: number;
  lon?: number;
  timezone: string;
};

type DemoSpecialtySeed = {
  key: string;
  name: string;
  description: string;
};

type DemoServiceSeed = {
  key: string;
  specialtyKey: string;
  description: string;
  cost: number;
  duration: number;
};

type DemoBookingSeed = {
  bookingNumber: string;
  offsetDays: number;
  time: string;
  bookingType: BookingType;
  status: BookingStatus;
  locationKey: string;
  serviceKey: string;
  therapistKey: string;
  patientKey: string;
  notes: string;
};

type DemoAvailabilitySeed = {
  title: string;
  notes: string;
  therapistKey: string;
  locationKey: string;
  startOffsetDays: number;
  endOffsetDays: number;
  weekdayNumbers: number[];
  sessionDurationMinutes: number;
  timeRanges: Array<{
    startTime: string;
    endTime: string;
  }>;
};

const DEMO_USERS: DemoUserSeed[] = [
  {
    key: "sofia-ramirez",
    email: "sofia.ramirez@example.com",
    firstname: "Sofia",
    lastname: "Ramirez",
    telefono: "+1 619 555 0101",
    informacionPublica:
      "Sofia leads Harbor Balance Wellness and focuses on nervous system regulation, posture, and whole-person recovery plans.",
    especialidad: "Nervous System Reset",
    summary:
      "Owner and lead therapist helping clients move from high stress into steadier, more resilient daily routines.",
    role: [UserRole.Admin, UserRole.Therapist],
    membershipRole: CompanyMembershipRole.Owner,
  },
  {
    key: "aaron-lee",
    email: "aaron.lee@example.com",
    firstname: "Aaron",
    lastname: "Lee",
    telefono: "+1 760 555 0144",
    informacionPublica:
      "Aaron supports clients with movement patterns, recovery planning, and performance-focused follow-up visits.",
    especialidad: "Functional Movement",
    summary:
      "Therapist focused on posture, mobility, and return-to-activity care for busy professionals and active adults.",
    role: [UserRole.Therapist],
    membershipRole: CompanyMembershipRole.Therapist,
  },
  {
    key: "elena-torres",
    email: "elena.torres@example.com",
    firstname: "Elena",
    lastname: "Torres",
    telefono: "+1 858 555 0177",
    informacionPublica:
      "Elena blends in-person and virtual support for clients navigating stress spikes, family transitions, and recovery routines.",
    especialidad: "Family Support",
    summary:
      "Therapist known for calm follow-up sessions, client education, and practical home care guidance.",
    role: [UserRole.Therapist],
    membershipRole: CompanyMembershipRole.Therapist,
  },
  {
    key: "maya-patel",
    email: "maya.patel@example.com",
    firstname: "Maya",
    lastname: "Patel",
    telefono: "+1 619 555 0118",
    summary:
      "Front desk coordinator who keeps the day moving and helps patients navigate scheduling changes with clarity.",
    role: [UserRole.FrontDesk],
    membershipRole: CompanyMembershipRole.FrontDesk,
    managedByKey: "sofia-ramirez",
  },
  {
    key: "isabella-cruz",
    email: "isabella.cruz@example.com",
    firstname: "Isabella",
    lastname: "Cruz",
    telefono: "+1 619 555 0181",
    role: [UserRole.Patient],
    membershipRole: CompanyMembershipRole.Patient,
  },
  {
    key: "marcus-nguyen",
    email: "marcus.nguyen@example.com",
    firstname: "Marcus",
    lastname: "Nguyen",
    telefono: "+1 760 555 0182",
    role: [UserRole.Patient],
    membershipRole: CompanyMembershipRole.Patient,
  },
  {
    key: "olivia-bennett",
    email: "olivia.bennett@example.com",
    firstname: "Olivia",
    lastname: "Bennett",
    telefono: "+1 858 555 0183",
    role: [UserRole.Patient],
    membershipRole: CompanyMembershipRole.Patient,
  },
  {
    key: "diego-ortega",
    email: "diego.ortega@example.com",
    firstname: "Diego",
    lastname: "Ortega",
    telefono: "+1 619 555 0184",
    role: [UserRole.Patient],
    membershipRole: CompanyMembershipRole.Patient,
  },
  {
    key: "priya-shah",
    email: "priya.shah@example.com",
    firstname: "Priya",
    lastname: "Shah",
    telefono: "+1 760 555 0185",
    role: [UserRole.Patient],
    membershipRole: CompanyMembershipRole.Patient,
  },
  {
    key: "gabriela-moreno",
    email: "gabriela.moreno@example.com",
    firstname: "Gabriela",
    lastname: "Moreno",
    telefono: "+1 858 555 0186",
    role: [UserRole.Patient],
    membershipRole: CompanyMembershipRole.Patient,
  },
  {
    key: "henry-walker",
    email: "henry.walker@example.com",
    firstname: "Henry",
    lastname: "Walker",
    telefono: "+1 619 555 0187",
    role: [UserRole.Patient],
    membershipRole: CompanyMembershipRole.Patient,
  },
];

const DEMO_LOCATIONS: DemoLocationSeed[] = [
  {
    key: "mission-hills",
    title: "Mission Hills Studio",
    address: "101 Harbor Plaza, Suite 220, San Diego, CA 92103",
    description:
      "Flagship studio for in-person reset sessions, follow-ups, and executive visits.",
    lat: 32.7472,
    lon: -117.1719,
    timezone: PST_TZ,
  },
  {
    key: "carlsbad",
    title: "Carlsbad Recovery Office",
    address: "2801 State Street, Suite 205, Carlsbad, CA 92008",
    description:
      "North County location with midweek availability for movement and recovery-focused care.",
    lat: 33.1605,
    lon: -117.3506,
    timezone: PST_TZ,
  },
  {
    key: "virtual-care",
    title: "Virtual Care",
    address: "Remote appointments across California",
    description:
      "Video follow-ups for clients who want continuity between in-person sessions.",
    timezone: PST_TZ,
  },
];

const DEMO_SPECIALTIES: DemoSpecialtySeed[] = [
  {
    key: "nervous-system-reset",
    name: "Nervous System Reset",
    description:
      "Hands-on care for clients dealing with overload, tension, and persistent stress responses.",
  },
  {
    key: "functional-movement",
    name: "Functional Movement",
    description:
      "Movement-based follow-up care focused on posture, balance, and day-to-day body mechanics.",
  },
  {
    key: "family-support",
    name: "Family Support",
    description:
      "Supportive sessions for teens, parents, and households navigating recovery together.",
  },
  {
    key: "executive-recovery",
    name: "Executive Recovery",
    description:
      "Focused sessions for founders, leaders, and high-demand professionals managing sustained stress.",
  },
];

const DEMO_SERVICES: DemoServiceSeed[] = [
  {
    key: "new-client-reset",
    specialtyKey: "nervous-system-reset",
    description: "New Client Reset Session",
    cost: 145,
    duration: 60,
  },
  {
    key: "follow-up-balance",
    specialtyKey: "nervous-system-reset",
    description: "Follow-Up Balance Session",
    cost: 110,
    duration: 45,
  },
  {
    key: "movement-assessment",
    specialtyKey: "functional-movement",
    description: "Movement and Posture Assessment",
    cost: 135,
    duration: 60,
  },
  {
    key: "teen-regulation",
    specialtyKey: "family-support",
    description: "Teen Regulation Session",
    cost: 125,
    duration: 50,
  },
  {
    key: "executive-intensive",
    specialtyKey: "executive-recovery",
    description: "Executive Recovery Intensive",
    cost: 185,
    duration: 75,
  },
  {
    key: "virtual-check-in",
    specialtyKey: "nervous-system-reset",
    description: "Virtual Integration Check-In",
    cost: 85,
    duration: 30,
  },
];

const DEMO_BOOKINGS: DemoBookingSeed[] = [
  {
    bookingNumber: "DEMO-HBW-001",
    offsetDays: 2,
    time: "09:00",
    bookingType: BookingType.DirectVisit,
    status: BookingStatus.Confirmed,
    locationKey: "mission-hills",
    serviceKey: "new-client-reset",
    therapistKey: "sofia-ramirez",
    patientKey: "isabella-cruz",
    notes: "First in-person visit after a month of interrupted sleep and neck tension.",
  },
  {
    bookingNumber: "DEMO-HBW-002",
    offsetDays: 4,
    time: "10:30",
    bookingType: BookingType.DirectVisit,
    status: BookingStatus.Confirmed,
    locationKey: "carlsbad",
    serviceKey: "movement-assessment",
    therapistKey: "aaron-lee",
    patientKey: "marcus-nguyen",
    notes: "Assessment for posture, desk setup strain, and recurring low-back tightness.",
  },
  {
    bookingNumber: "DEMO-HBW-003",
    offsetDays: 6,
    time: "13:00",
    bookingType: BookingType.VideoCall,
    status: BookingStatus.Pending,
    locationKey: "virtual-care",
    serviceKey: "virtual-check-in",
    therapistKey: "elena-torres",
    patientKey: "olivia-bennett",
    notes: "Short follow-up to review recovery notes between travel-heavy work weeks.",
  },
  {
    bookingNumber: "DEMO-HBW-004",
    offsetDays: -3,
    time: "11:00",
    bookingType: BookingType.DirectVisit,
    status: BookingStatus.Completed,
    locationKey: "mission-hills",
    serviceKey: "follow-up-balance",
    therapistKey: "sofia-ramirez",
    patientKey: "diego-ortega",
    notes: "Completed follow-up after a strong response to the first reset session.",
  },
  {
    bookingNumber: "DEMO-HBW-005",
    offsetDays: 8,
    time: "15:00",
    bookingType: BookingType.DirectVisit,
    status: BookingStatus.NeedsAttention,
    locationKey: "carlsbad",
    serviceKey: "executive-intensive",
    therapistKey: "aaron-lee",
    patientKey: "priya-shah",
    notes: "Client requested a longer visit and left a note asking about schedule flexibility.",
  },
  {
    bookingNumber: "DEMO-HBW-006",
    offsetDays: -10,
    time: "09:30",
    bookingType: BookingType.VideoCall,
    status: BookingStatus.Completed,
    locationKey: "virtual-care",
    serviceKey: "virtual-check-in",
    therapistKey: "elena-torres",
    patientKey: "gabriela-moreno",
    notes: "Remote follow-up focused on home-care habits and stress triggers.",
  },
  {
    bookingNumber: "DEMO-HBW-007",
    offsetDays: 11,
    time: "14:00",
    bookingType: BookingType.DirectVisit,
    status: BookingStatus.Cancelled,
    locationKey: "mission-hills",
    serviceKey: "follow-up-balance",
    therapistKey: "sofia-ramirez",
    patientKey: "henry-walker",
    notes: "Cancelled by client after a work trip was moved earlier in the week.",
  },
  {
    bookingNumber: "DEMO-HBW-008",
    offsetDays: 15,
    time: "09:45",
    bookingType: BookingType.DirectVisit,
    status: BookingStatus.Confirmed,
    locationKey: "mission-hills",
    serviceKey: "follow-up-balance",
    therapistKey: "sofia-ramirez",
    patientKey: "isabella-cruz",
    notes: "Planned follow-up to maintain progress from the initial visit.",
  },
  {
    bookingNumber: "DEMO-HBW-009",
    offsetDays: 5,
    time: "16:15",
    bookingType: BookingType.PhoneCall,
    status: BookingStatus.Confirmed,
    locationKey: "virtual-care",
    serviceKey: "virtual-check-in",
    therapistKey: "elena-torres",
    patientKey: "gabriela-moreno",
    notes: "Short phone check-in ahead of an in-person family session.",
  },
];

const DEMO_AVAILABILITY: DemoAvailabilitySeed[] = [
  {
    title: "Demo - Sofia Ramirez - Mission Hills",
    notes: "Primary in-person schedule for new clients and follow-up sessions.",
    therapistKey: "sofia-ramirez",
    locationKey: "mission-hills",
    startOffsetDays: 1,
    endOffsetDays: 28,
    weekdayNumbers: [1, 3],
    sessionDurationMinutes: 60,
    timeRanges: [
      { startTime: "09:00", endTime: "12:00" },
      { startTime: "13:00", endTime: "16:00" },
    ],
  },
  {
    title: "Demo - Aaron Lee - Carlsbad",
    notes: "Midweek schedule for movement and recovery-focused care.",
    therapistKey: "aaron-lee",
    locationKey: "carlsbad",
    startOffsetDays: 1,
    endOffsetDays: 28,
    weekdayNumbers: [2, 4],
    sessionDurationMinutes: 60,
    timeRanges: [
      { startTime: "10:00", endTime: "13:00" },
      { startTime: "14:00", endTime: "17:00" },
    ],
  },
  {
    title: "Demo - Elena Torres - Virtual Care",
    notes: "Remote continuity care for follow-ups and family support.",
    therapistKey: "elena-torres",
    locationKey: "virtual-care",
    startOffsetDays: 1,
    endOffsetDays: 28,
    weekdayNumbers: [1, 5],
    sessionDurationMinutes: 30,
    timeRanges: [
      { startTime: "08:30", endTime: "11:30" },
      { startTime: "12:30", endTime: "15:30" },
    ],
  },
  {
    title: "Demo - Sofia Ramirez - Virtual Care",
    notes: "Short virtual follow-ups for established clients.",
    therapistKey: "sofia-ramirez",
    locationKey: "virtual-care",
    startOffsetDays: 1,
    endOffsetDays: 28,
    weekdayNumbers: [6],
    sessionDurationMinutes: 30,
    timeRanges: [
      { startTime: "09:00", endTime: "12:00" },
    ],
  },
];

const DEMO_LANDING_PAGE_CONFIG = serializeLandingPageConfig({
  hero: {
    visible: true,
    badge: {
      "en-US": "Serving San Diego and North County",
      "es-MX": "Atendiendo San Diego y North County",
    },
    helper: {
      "en-US": "A calmer intake, clearer communication, and care that feels steady from the first visit.",
      "es-MX": "Una experiencia mas calmada, comunicacion clara y seguimiento consistente desde la primera visita.",
    },
    showcaseSummary: {
      "en-US": "Book in-person or virtual sessions with a team focused on nervous system regulation and practical recovery support.",
      "es-MX": "Agenda sesiones presenciales o virtuales con un equipo enfocado en regulacion del sistema nervioso y recuperacion practica.",
    },
  },
  support: {
    visible: true,
    eyebrow: {
      "en-US": "Support that feels grounded",
      "es-MX": "Acompanamiento con claridad",
    },
    title: {
      "en-US": "Personal care for busy adults, families, and high-stress seasons",
      "es-MX": "Cuidado personal para adultos ocupados, familias y etapas de mucho estres",
    },
    description: {
      "en-US": "The demo practice is positioned as a boutique recovery studio with in-person care, virtual follow-up, and a polished intake flow.",
      "es-MX": "Esta practica demo se presenta como un estudio boutique de recuperacion con cuidado presencial, seguimiento virtual y una experiencia de ingreso clara.",
    },
    cards: [
      {
        title: {
          "en-US": "Reset sessions with context",
          "es-MX": "Sesiones con contexto",
        },
        description: {
          "en-US": "Clients move from first appointment to follow-up with notes that reflect real patterns, not just a one-off visit.",
          "es-MX": "Las personas pasan de la primera cita al seguimiento con notas que reflejan patrones reales, no solo una visita aislada.",
        },
      },
      {
        title: {
          "en-US": "Flexible locations",
          "es-MX": "Ubicaciones flexibles",
        },
        description: {
          "en-US": "Mission Hills, Carlsbad, and virtual care make the schedule feel believable in a sales walkthrough.",
          "es-MX": "Mission Hills, Carlsbad y la atencion virtual hacen que la agenda se sienta realista en una presentacion comercial.",
        },
      },
      {
        title: {
          "en-US": "Operational clarity",
          "es-MX": "Operacion mas clara",
        },
        description: {
          "en-US": "Front desk, therapist, and patient records all read like a real small practice instead of placeholder data.",
          "es-MX": "Los registros de recepcion, terapeutas y pacientes se sienten como los de una practica real y no como datos de relleno.",
        },
      },
    ],
  },
  journey: {
    visible: true,
    eyebrow: {
      "en-US": "What booking looks like",
      "es-MX": "Como se agenda",
    },
    title: {
      "en-US": "A booking flow that feels polished for demos and real for customers",
      "es-MX": "Un flujo de reserva pulido para demos y creible para clientes",
    },
    description: {
      "en-US": "The seeded data gives the public flow meaningful locations, services, and upcoming availability right away.",
      "es-MX": "Los datos sembrados dejan listo el flujo publico con ubicaciones, servicios y disponibilidad real desde el primer momento.",
    },
    steps: [
      {
        title: {
          "en-US": "Choose a service that makes sense",
          "es-MX": "Elige un servicio claro",
        },
        description: {
          "en-US": "Services are written in customer language instead of generic e2e labels.",
          "es-MX": "Los servicios estan escritos con lenguaje para clientes y no con etiquetas genericas de e2e.",
        },
      },
      {
        title: {
          "en-US": "See believable availability",
          "es-MX": "Ve horarios creibles",
        },
        description: {
          "en-US": "Schedules are distributed across therapists and locations the way a small practice would actually run them.",
          "es-MX": "Los horarios se distribuyen entre terapeutas y ubicaciones como ocurriria en una practica pequena.",
        },
      },
      {
        title: {
          "en-US": "Capture patient details safely",
          "es-MX": "Captura datos con seguridad",
        },
        description: {
          "en-US": "Returning patient suggestions still avoid risky phone-only identity merges.",
          "es-MX": "Las sugerencias para pacientes recurrentes siguen evitando uniones riesgosas por telefono solamente.",
        },
      },
    ],
  },
  locations: {
    visible: true,
    eyebrow: {
      "en-US": "Where care happens",
      "es-MX": "Donde sucede la atencion",
    },
    title: {
      "en-US": "One flagship studio, one satellite office, and virtual continuity care",
      "es-MX": "Un estudio principal, una oficina satelite y continuidad virtual",
    },
    description: {
      "en-US": "This mix gives the demo enough range to show location-based booking without becoming noisy.",
      "es-MX": "Esta mezcla le da a la demo suficiente variedad para mostrar reservas por ubicacion sin volverse ruidosa.",
    },
    emptyMessage: {
      "en-US": "Locations will appear here after the practice adds them.",
      "es-MX": "Las ubicaciones apareceran aqui cuando la practica las agregue.",
    },
  },
  blog: {
    visible: true,
    title: {
      "en-US": "",
      "es-MX": "",
    },
    description: {
      "en-US": "",
      "es-MX": "",
    },
  },
  specialties: {
    visible: true,
    title: {
      "en-US": "",
      "es-MX": "",
    },
    description: {
      "en-US": "",
      "es-MX": "",
    },
  },
});

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function dateFromToday(offsetDays: number) {
  const date = startOfToday();
  date.setDate(date.getDate() + offsetDays);
  return date;
}

function hasSameRoles(a: UserRole[], b: UserRole[]) {
  if (a.length !== b.length) {
    return false;
  }

  const aSorted = [...a].sort();
  const bSorted = [...b].sort();

  return aSorted.every((role, index) => role === bSorted[index]);
}

function mustGet<K, V>(map: Map<K, V>, key: K, label: string) {
  const value = map.get(key);

  if (!value) {
    throw new Error(`Missing ${label}: ${String(key)}`);
  }

  return value;
}

async function ensureUsers() {
  const users = new Map<
    string,
    {
      id: string;
      email: string;
      firstname: string;
      lastname: string;
      telefono: string | null;
      role: UserRole[];
    }
  >();

  for (const seed of DEMO_USERS) {
    const passwordHash = hashPassword(DEMO_PASSWORD);
    const existing = await prisma.user.findUnique({
      where: { email: seed.email },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        telefono: true,
        role: true,
      },
    });

    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
        data: {
            firstname: seed.firstname,
            lastname: seed.lastname,
            telefono: seed.telefono ?? null,
            informacionPublica: seed.informacionPublica ?? null,
            especialidad: seed.especialidad ?? null,
            summary: seed.summary ?? null,
            passwordHash,
            mustChangePassword: false,
            role: hasSameRoles(existing.role, seed.role) ? undefined : seed.role,
          },
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
            telefono: true,
            role: true,
          },
        })
      : await prisma.user.create({
          data: {
            email: seed.email,
            firstname: seed.firstname,
            lastname: seed.lastname,
            telefono: seed.telefono ?? null,
            informacionPublica: seed.informacionPublica ?? null,
            especialidad: seed.especialidad ?? null,
            summary: seed.summary ?? null,
            role: seed.role,
            passwordHash,
            mustChangePassword: false,
          },
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
            telefono: true,
            role: true,
          },
        });

    users.set(seed.key, user);
  }

  for (const seed of DEMO_USERS) {
    const user = mustGet(users, seed.key, "demo user");
    const managedByTherapistId = seed.managedByKey
      ? mustGet(users, seed.managedByKey, "managed therapist").id
      : null;

    await prisma.user.update({
      where: { id: user.id },
      data: { managedByTherapistId },
    });
  }

  return users;
}

async function ensureCompany(publicTherapistId: string) {
  return prisma.company.upsert({
    where: { slug: COMPANY_SLUG },
    update: {
      name: "Harbor Balance Wellness",
      logo: null,
      headerLogo: null,
      publicEmail: "hello@harborbalance.example.com",
      publicPhone: "+1 619 555 0100",
      publicDescription:
        "Harbor Balance Wellness offers in-person and virtual care focused on nervous system regulation, practical recovery, and clearer day-to-day wellbeing.",
      publicSummary:
        "Book appointments, review real therapist availability, and experience a polished small-practice workflow that feels ready for demos.",
      publicSpecialty: "Nervous system reset and recovery care",
      landingPageConfig: DEMO_LANDING_PAGE_CONFIG,
      defaultTimezone: PST_TZ,
      publicTherapistId,
      weekdaysHours: "9:00 AM - 6:00 PM",
      saturdayHours: "9:00 AM - 1:00 PM",
      sundayHours: "Closed",
      facebook: "https://facebook.com/harborbalance",
      instagram: "https://instagram.com/harborbalance",
      linkedin: "https://linkedin.com/company/harborbalance",
      website: "https://harborbalance.example.com",
    },
    create: {
      slug: COMPANY_SLUG,
      name: "Harbor Balance Wellness",
      logo: null,
      headerLogo: null,
      publicEmail: "hello@harborbalance.example.com",
      publicPhone: "+1 619 555 0100",
      publicDescription:
        "Harbor Balance Wellness offers in-person and virtual care focused on nervous system regulation, practical recovery, and clearer day-to-day wellbeing.",
      publicSummary:
        "Book appointments, review real therapist availability, and experience a polished small-practice workflow that feels ready for demos.",
      publicSpecialty: "Nervous system reset and recovery care",
      landingPageConfig: DEMO_LANDING_PAGE_CONFIG,
      defaultTimezone: PST_TZ,
      publicTherapistId,
      weekdaysHours: "9:00 AM - 6:00 PM",
      saturdayHours: "9:00 AM - 1:00 PM",
      sundayHours: "Closed",
      facebook: "https://facebook.com/harborbalance",
      instagram: "https://instagram.com/harborbalance",
      linkedin: "https://linkedin.com/company/harborbalance",
      website: "https://harborbalance.example.com",
    },
    select: {
      id: true,
      slug: true,
      name: true,
    },
  });
}

async function ensureMemberships(
  companyId: string,
  users: Map<
    string,
    {
      id: string;
    }
  >,
) {
  for (const seed of DEMO_USERS) {
    const user = mustGet(users, seed.key, "demo user");

    await prisma.companyMembership.upsert({
      where: {
        companyId_userId: {
          companyId,
          userId: user.id,
        },
      },
      update: {
        role: seed.membershipRole,
      },
      create: {
        companyId,
        userId: user.id,
        role: seed.membershipRole,
      },
    });
  }
}

async function ensureLocations(companyId: string) {
  const existing = await prisma.location.findMany({
    where: {
      companyId,
      title: {
        in: DEMO_LOCATIONS.map((location) => location.title),
      },
    },
    select: {
      id: true,
      title: true,
      timezone: true,
    },
  });

  const existingByTitle = new Map(existing.map((location) => [location.title, location]));
  const locations = new Map<string, { id: string; title: string; timezone: string }>();

  for (const seed of DEMO_LOCATIONS) {
    const match = existingByTitle.get(seed.title);
    const location = match
      ? await prisma.location.update({
          where: { id: match.id },
          data: {
            address: seed.address,
            description: seed.description,
            lat: seed.lat ?? null,
            lon: seed.lon ?? null,
            timezone: seed.timezone,
          },
          select: {
            id: true,
            title: true,
            timezone: true,
          },
        })
      : await prisma.location.create({
          data: {
            companyId,
            title: seed.title,
            address: seed.address,
            description: seed.description,
            lat: seed.lat ?? null,
            lon: seed.lon ?? null,
            timezone: seed.timezone,
          },
          select: {
            id: true,
            title: true,
            timezone: true,
          },
        });

    locations.set(seed.key, location);
  }

  return locations;
}

async function ensureSpecialties(companyId: string) {
  const existing = await prisma.specialty.findMany({
    where: {
      companyId,
      name: {
        in: DEMO_SPECIALTIES.map((specialty) => specialty.name),
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const existingByName = new Map(existing.map((specialty) => [specialty.name, specialty]));
  const specialties = new Map<string, { id: string; name: string }>();

  for (const seed of DEMO_SPECIALTIES) {
    const match = existingByName.get(seed.name);
    const specialty = match
      ? await prisma.specialty.update({
          where: { id: match.id },
          data: {
            description: seed.description,
          },
          select: {
            id: true,
            name: true,
          },
        })
      : await prisma.specialty.create({
          data: {
            companyId,
            name: seed.name,
            description: seed.description,
          },
          select: {
            id: true,
            name: true,
          },
        });

    specialties.set(seed.key, specialty);
  }

  return specialties;
}

async function ensureServices(
  companyId: string,
  specialties: Map<string, { id: string; name: string }>,
) {
  const services = new Map<
    string,
    {
      id: string;
      description: string;
      duration: number;
      specialtyId: string;
    }
  >();

  for (const seed of DEMO_SERVICES) {
    const specialty = mustGet(specialties, seed.specialtyKey, "demo specialty");
    const existing = await prisma.service.findFirst({
      where: {
        companyId,
        specialtyId: specialty.id,
        description: seed.description,
      },
      select: {
        id: true,
      },
    });

    const service = existing
      ? await prisma.service.update({
          where: { id: existing.id },
          data: {
            cost: seed.cost,
            duration: seed.duration,
          },
          select: {
            id: true,
            description: true,
            duration: true,
            specialtyId: true,
          },
        })
      : await prisma.service.create({
          data: {
            companyId,
            specialtyId: specialty.id,
            description: seed.description,
            cost: seed.cost,
            duration: seed.duration,
          },
          select: {
            id: true,
            description: true,
            duration: true,
            specialtyId: true,
          },
        });

    services.set(seed.key, service);
  }

  return services;
}

async function ensureBookings(params: {
  companyId: string;
  users: Map<
    string,
    {
      id: string;
      email: string;
      firstname: string;
      lastname: string;
      telefono: string | null;
    }
  >;
  locations: Map<string, { id: string; title: string; timezone: string }>;
  services: Map<
    string,
    {
      id: string;
      description: string;
      duration: number;
      specialtyId: string;
    }
  >;
}) {
  const { companyId, users, locations, services } = params;

  for (const seed of DEMO_BOOKINGS) {
    const patient = mustGet(users, seed.patientKey, "demo patient");
    const therapist = mustGet(users, seed.therapistKey, "demo therapist");
    const location = mustGet(locations, seed.locationKey, "demo location");
    const service = mustGet(services, seed.serviceKey, "demo service");
    const bookingDate = dateFromToday(seed.offsetDays);

    await prisma.booking.upsert({
      where: {
        bookingNumber: seed.bookingNumber,
      },
      update: {
        companyId,
        bookingType: seed.bookingType,
        locationId: location.id,
        specialtyId: service.specialtyId,
        serviceId: service.id,
        bookedDurationMinutes: service.duration,
        firstname: patient.firstname,
        lastname: patient.lastname,
        phone: patient.telefono || "",
        email: patient.email,
        givenConsent: true,
        therapistId: therapist.id,
        patientId: patient.id,
        bookingNotes: seed.notes,
        bookingSchedule: combineDateAndTimeToUtc(bookingDate, seed.time, location.timezone),
        status: seed.status,
      },
      create: {
        bookingNumber: seed.bookingNumber,
        companyId,
        bookingType: seed.bookingType,
        locationId: location.id,
        specialtyId: service.specialtyId,
        serviceId: service.id,
        bookedDurationMinutes: service.duration,
        firstname: patient.firstname,
        lastname: patient.lastname,
        phone: patient.telefono || "",
        email: patient.email,
        givenConsent: true,
        therapistId: therapist.id,
        patientId: patient.id,
        bookingNotes: seed.notes,
        bookingSchedule: combineDateAndTimeToUtc(bookingDate, seed.time, location.timezone),
        status: seed.status,
      },
    });
  }
}

async function ensureAvailability(params: {
  companyId: string;
  users: Map<
    string,
    {
      id: string;
    }
  >;
  locations: Map<string, { id: string; title: string; timezone: string }>;
}) {
  const { companyId, users, locations } = params;

  for (const seed of DEMO_AVAILABILITY) {
    const therapist = mustGet(users, seed.therapistKey, "demo therapist");
    const location = mustGet(locations, seed.locationKey, "demo location");
    const startDate = dateFromToday(seed.startOffsetDays);
    const endDate = dateFromToday(seed.endOffsetDays);

    const existingPeriod = await prisma.availabilityPeriod.findFirst({
      where: {
        companyId,
        therapistId: therapist.id,
        locationId: location.id,
        title: seed.title,
      },
      select: { id: true },
    });

    const period = existingPeriod
      ? await prisma.availabilityPeriod.update({
          where: { id: existingPeriod.id },
          data: {
            notes: seed.notes,
            startDate,
            endDate,
            isActive: true,
          },
          select: { id: true },
        })
      : await prisma.availabilityPeriod.create({
          data: {
            companyId,
            therapistId: therapist.id,
            locationId: location.id,
            title: seed.title,
            notes: seed.notes,
            startDate,
            endDate,
            isActive: true,
          },
          select: { id: true },
        });

    for (let offset = seed.startOffsetDays; offset <= seed.endOffsetDays; offset += 1) {
      const date = dateFromToday(offset);

      if (!seed.weekdayNumbers.includes(date.getDay())) {
        continue;
      }

      const day = await prisma.availabilityDay.upsert({
        where: {
          therapistId_locationId_date: {
            therapistId: therapist.id,
            locationId: location.id,
            date,
          },
        },
        update: {
          availabilityPeriodId: period.id,
          companyId,
          sessionDurationMinutes: seed.sessionDurationMinutes,
          isAvailable: true,
          notes: seed.notes,
        },
        create: {
          availabilityPeriodId: period.id,
          companyId,
          therapistId: therapist.id,
          locationId: location.id,
          date,
          sessionDurationMinutes: seed.sessionDurationMinutes,
          isAvailable: true,
          notes: seed.notes,
        },
        select: { id: true },
      });

      for (const range of seed.timeRanges) {
        await prisma.availabilityTimeRange.upsert({
          where: {
            availabilityDayId_startTime_endTime: {
              availabilityDayId: day.id,
              startTime: range.startTime,
              endTime: range.endTime,
            },
          },
          update: {
            isActive: true,
          },
          create: {
            availabilityDayId: day.id,
            startTime: range.startTime,
            endTime: range.endTime,
            isActive: true,
          },
        });
      }
    }
  }
}

export async function main() {
  console.log("🌱 Starting demo seed...");

  const users = await ensureUsers();
  const publicTherapist = mustGet(users, "sofia-ramirez", "public therapist");
  const company = await ensureCompany(publicTherapist.id);

  await ensureMemberships(company.id, users);

  const locations = await ensureLocations(company.id);
  const specialties = await ensureSpecialties(company.id);
  const services = await ensureServices(company.id, specialties);

  await ensureBookings({
    companyId: company.id,
    users,
    locations,
    services,
  });

  await ensureAvailability({
    companyId: company.id,
    users,
    locations,
  });

  const summary = await Promise.all([
    prisma.company.count({ where: { slug: COMPANY_SLUG } }),
    prisma.companyMembership.count({ where: { companyId: company.id } }),
    prisma.location.count({ where: { companyId: company.id } }),
    prisma.specialty.count({ where: { companyId: company.id } }),
    prisma.service.count({ where: { companyId: company.id } }),
    prisma.booking.count({ where: { companyId: company.id } }),
    prisma.availabilityPeriod.count({ where: { companyId: company.id, title: { startsWith: "Demo -" } } }),
    prisma.availabilityDay.count({ where: { companyId: company.id } }),
  ]);

  console.log("✅ Demo seed complete");
  console.table({
    companySlug: COMPANY_SLUG,
    sharedPassword: DEMO_PASSWORD,
    companies: summary[0],
    memberships: summary[1],
    locations: summary[2],
    specialties: summary[3],
    services: summary[4],
    bookings: summary[5],
    availabilityPeriods: summary[6],
    availabilityDays: summary[7],
  });
  console.log(
    `Use DEFAULT_COMPANY_SLUG=${COMPANY_SLUG} to render the demo company on the public site.`,
  );
}

main()
  .catch((error) => {
    console.error("❌ Demo seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
