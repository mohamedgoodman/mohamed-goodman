import {
  BarChart3,
  BookOpen,
  Ear,
  Globe2,
  GraduationCap,
  LayoutDashboard,
  Mic,
  Repeat2,
  Settings,
  Speech,
  Volume2,
} from "lucide-react";

import type { Dictionary } from "@/i18n/dictionaries/en";

export interface NavItem {
  href: string;
  /** Key into the nav section of the dictionary — resolved at render time. */
  labelKey: keyof Dictionary["nav"];
  icon: typeof LayoutDashboard;
  /** Shown in the compact mobile bar. */
  primary?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard, primary: true },
  { href: "/learn", labelKey: "learn", icon: GraduationCap, primary: true },
  { href: "/real-english", labelKey: "realEnglish", icon: Speech },
  { href: "/immersion", labelKey: "immersion", icon: Globe2 },
  { href: "/listening", labelKey: "listening", icon: Ear, primary: true },
  { href: "/speaking", labelKey: "speaking", icon: Mic },
  { href: "/pronunciation", labelKey: "pronunciation", icon: Volume2 },
  { href: "/vocabulary", labelKey: "vocabulary", icon: BookOpen, primary: true },
  { href: "/review", labelKey: "review", icon: Repeat2, primary: true },
  { href: "/progress", labelKey: "progress", icon: BarChart3 },
  { href: "/settings", labelKey: "settings", icon: Settings },
];
