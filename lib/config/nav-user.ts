import {
  BadgeCheck,
  CalendarPlus,
  LogOut,
  LucideIcon,
} from "lucide-react";

export interface NavUserMenuItem {
  label: string;
  icon: LucideIcon;
  action?: () => void;
  url?: string;
  separator?: boolean;
}

export interface NavUserConfig {
  items: NavUserMenuItem[];
  logoutItem: NavUserMenuItem;
}

export const getNavUserConfig = (
  t: (key: string) => string,
  logoutAction: () => void
): NavUserConfig => {
  return {
    items: [
      {
        label: t("profile"),
        icon: BadgeCheck,
        url: "/profile",
      },
      {
        label: t("newBooking"),
        icon: CalendarPlus,
        url: "/booking",
      },
    ],
    logoutItem: {
      label: t("logout"),
      icon: LogOut,
      action: logoutAction,
    },
  };
};
