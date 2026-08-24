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

export interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** Shown in the compact mobile bar. */
  primary?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, primary: true },
  { href: "/learn", label: "Learn", icon: GraduationCap, primary: true },
  { href: "/real-english", label: "Real English", icon: Speech },
  { href: "/immersion", label: "Immersion", icon: Globe2 },
  { href: "/listening", label: "Listening", icon: Ear, primary: true },
  { href: "/speaking", label: "Speaking", icon: Mic },
  { href: "/pronunciation", label: "Pronunciation", icon: Volume2 },
  { href: "/vocabulary", label: "Vocabulary", icon: BookOpen, primary: true },
  { href: "/review", label: "Review", icon: Repeat2, primary: true },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];
