import {
  BarChart3,
  BookOpen,
  Clock,
  Cog,
  LayoutDashboard,
  LifeBuoy,
  LucideIcon,
  Send,
  User,
  Users,
  Monitor,
} from "lucide-react";

export interface SidebarNavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: Array<{
    title: string;
    url: string;
  }>;
}

export interface SidebarProject {
  name: string;
  url: string;
  icon: LucideIcon;
}

export interface SidebarConfig {
  navMain: SidebarNavItem[];
  navSecondary: SidebarNavItem[];
  projects: SidebarProject[];
}

export type SidebarRoleMode = "therapist" | "frontDesk" | "patient";

export const getSidebarConfig = (
  t: (key: string) => string,
  roleMode: SidebarRoleMode
): SidebarConfig => {
  const baseNavMain: SidebarNavItem[] = [];

  // Navegación para Therapist (que también es Admin)
  const therapistNavMain: SidebarNavItem[] = [
    ...baseNavMain,
    {
      title: t("myDashboard"),
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: t("dashboard"),
          url: "/dashboard",
        },
        {
          title: t("myAppointments"),
          url: "/appointments",
        },
      ],
    },
    {
      title: t("management"),
      url: "/specialties",
      icon: Cog,
      isActive: true,
      items: [
        {
          title: t("specialties"),
          url: "/specialties",
        },
        {
          title: t("locations"),
          url: "/locations",
        },
        {
          title: t("availability"),
          url: "/availability",
        },
        {
          title: t("personnel"),
          url: "/personnel",
        },
      ],
    },
  ];

  const frontDeskNavMain: SidebarNavItem[] = [
    ...baseNavMain,
    {
      title: t("myDashboard"),
      url: "/appointments",
      icon: LayoutDashboard,
      items: [
        {
          title: t("myAppointments"),
          url: "/appointments",
        },
      ],
    },
  ];

  // Navegación para Usuario Regular (solo funciones básicas)
  const regularUserNavMain: SidebarNavItem[] = [
    ...baseNavMain,
    {
      title: t("myAccount"),
      url: "/appointments",
      icon: BookOpen,
      items: [
        {
          title: t("myAppointments"),
          url: "/appointments",
        },
      ],
    },
  ];

  // Proyectos específicos por rol
  const therapistProjects: SidebarProject[] = [
    {
      name: t("myStats"),
      url: "/",
      icon: BarChart3,
    },
    {
      name: t("myPatients"),
      url: "/",
      icon: Users,
    },
  ];

  const frontDeskProjects: SidebarProject[] = [];

  const regularUserProjects: SidebarProject[] = [
    {
      name: t("myHistory"),
      url: "/",
      icon: Clock,
    },
    {
      name: t("favorites"),
      url: "/",
      icon: BookOpen,
    },
  ];

  return {
    navMain:
      roleMode === "therapist"
        ? therapistNavMain
        : roleMode === "frontDesk"
          ? frontDeskNavMain
          : regularUserNavMain,
    navSecondary: [
      {
        title: t("profile"),
        url: "/profile",
        icon: User,
      },
      {
        title: t("support"),
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: t("feedback"),
        url: "#",
        icon: Send,
      },
      {
        title: t("publicView"),
        url: "/",
        icon: Monitor,
      },
    ],
    projects:
      roleMode === "therapist"
        ? therapistProjects
        : roleMode === "frontDesk"
          ? frontDeskProjects
          : regularUserProjects,
  };
};
