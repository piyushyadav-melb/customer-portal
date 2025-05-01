import { DashBoard, Settings } from "@/components/svg";

export interface MenuItemProps {
  title: string;
  icon: any;
  href?: string;
  child?: MenuItemProps[];
  megaMenu?: MenuItemProps[];
  multi_menu?: MenuItemProps[];
  nested?: MenuItemProps[];
  onClick: () => void;
}

export const menusConfig = {
  mainNav: [
    {
      title: "Dashboard",
      icon: DashBoard,
      href: "/dashboard",
    },
    {
      title: "Find Expert",
      icon: Settings,
      href: "/find-expert",
    },
    {
      title: "Bookings",
      icon: Settings,
      href: "/bookings",
    },
    {
      title: "Meetings",
      icon: Settings,
      href: "/meetings",
    },
  ],
  sidebarNav: {
    modern: [
      {
        title: "Dashboard",
        icon: DashBoard,
        href: "/dashboard",
      },
      {
        title: "Find Expert",
        icon: Settings,
        href: "/find-expert",
      },
      {
        title: "Bookings",
        icon: Settings,
        href: "/bookings",
      },
      {
        title: "Meetings",
        icon: Settings,
        href: "/meetings",
      },
    ],
    classic: [
      {
        isHeader: true,
        title: "menu",
      },
      {
        title: "Dashboard",
        icon: DashBoard,
        href: "/dashboard",
      },
      {
        title: "Find Expert",
        icon: Settings,
        href: "/find-expert",
      },
      {
        title: "Bookings",
        icon: Settings,
        href: "/bookings",
      },
      {
        title: "Meetings",
        icon: Settings,
        href: "/meetings",
      },
    ],
  },
};

export type ModernNavType = (typeof menusConfig.sidebarNav.modern)[number];
export type ClassicNavType = (typeof menusConfig.sidebarNav.classic)[number];
export type MainNavType = (typeof menusConfig.mainNav)[number];
