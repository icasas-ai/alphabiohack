import {
  Building2,
  BookOpen,
  Cog,
  LayoutDashboard,
  LucideIcon,
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

export interface SidebarConfig {
  navMain: SidebarNavItem[];
  navSecondary: SidebarNavItem[];
}

export type SidebarRoleMode = "admin" | "therapist" | "frontDesk" | "patient";

export const getSidebarConfig = (
  t: (key: string) => string,
  roleMode: SidebarRoleMode
): SidebarConfig => {
  const baseNavMain: SidebarNavItem[] = [];

  const adminNavMain: SidebarNavItem[] = [
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
          url: "/bookings",
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
          title: t("availability"),
          url: "/availability",
        },
        {
          title: t("locations"),
          url: "/locations",
        },
        {
          title: t("personnel"),
          url: "/personnel",
        },
      ],
    },
  ];

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
          url: "/bookings",
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
          title: t("availability"),
          url: "/availability",
        },
      ],
    },
  ];

  const frontDeskNavMain: SidebarNavItem[] = [
    ...baseNavMain,
    {
      title: t("myDashboard"),
      url: "/bookings",
      icon: LayoutDashboard,
      items: [
        {
          title: t("myAppointments"),
          url: "/bookings",
        },
      ],
    },
  ];

  // Navegación para Usuario Regular (solo funciones básicas)
  const regularUserNavMain: SidebarNavItem[] = [
    ...baseNavMain,
    {
      title: t("myAccount"),
      url: "/bookings",
      icon: BookOpen,
      items: [
        {
          title: t("myAppointments"),
          url: "/bookings",
        },
      ],
    },
  ];

  return {
    navMain:
      roleMode === "admin"
        ? adminNavMain
        : roleMode === "therapist"
          ? therapistNavMain
        : roleMode === "frontDesk"
          ? frontDeskNavMain
          : regularUserNavMain,
    navSecondary: [
      {
        title: t("company"),
        url: "/company",
        icon: Building2,
      },
      {
        title: t("publicView"),
        url: "/",
        icon: Monitor,
      },
    ],
  };
};
