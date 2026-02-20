import {
  BarChart3,
  BookOpen,
  Clock,
  Cog,
  Globe,
  LayoutDashboard,
  LifeBuoy,
  LucideIcon,
  Send,
  User,
  Users,
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

export const getSidebarConfig = (
  t: (key: string) => string,
  isTherapist: boolean
): SidebarConfig => {
  const baseNavMain: SidebarNavItem[] = [
    {
      title: t("website"),
      url: "#",
      icon: Globe,
      isActive: true,
      items: [
        {
          title: t("home"),
          url: "/",
        },
        {
          title: t("booking"),
          url: "/booking",
        },
        {
          title: t("contact"),
          url: "/contact",
        },
      ],
    },
  ];

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
      url: "#",
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
      ],
    },
  ];

  // Navegación para Usuario Regular (solo funciones básicas)
  const regularUserNavMain: SidebarNavItem[] = [
    ...baseNavMain,
    {
      title: t("myAccount"),
      url: "#",
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
    navMain: isTherapist ? therapistNavMain : regularUserNavMain,
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
    ],
    projects: isTherapist ? therapistProjects : regularUserProjects,
  };
};
