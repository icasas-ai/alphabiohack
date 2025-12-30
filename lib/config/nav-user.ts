import {
  BadgeCheck,
  Bell,
  CreditCard,
  LogOut,
  LucideIcon,
  Sparkles,
} from "lucide-react";

export interface NavUserMenuItem {
  label: string;
  icon: LucideIcon;
  action?: () => void;
  url?: string;
  separator?: boolean;
}

export interface NavUserConfig {
  upgradeItem: NavUserMenuItem;
  accountItems: NavUserMenuItem[];
  logoutItem: NavUserMenuItem;
}

export const getNavUserConfig = (
  t: (key: string) => string,
  logoutAction: () => void
): NavUserConfig => {
  return {
    upgradeItem: {
      label: t("upgradeToPro"),
      icon: Sparkles,
      url: "/upgrade",
    },
    accountItems: [
      {
        label: t("account"),
        icon: BadgeCheck,
        url: "/profile",
      },
      {
        label: t("billing"),
        icon: CreditCard,
        url: "/billing",
      },
      {
        label: t("notifications"),
        icon: Bell,
        url: "/notifications",
      },
    ],
    logoutItem: {
      label: t("logout"),
      icon: LogOut,
      action: logoutAction,
    },
  };
};
