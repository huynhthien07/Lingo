"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  TestTube,
  CreditCard,
  Settings,
  Shield,
  GraduationCap,
  ClipboardList,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  role?: "ADMIN" | "TEACHER" | "STUDENT";
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ("ADMIN" | "TEACHER" | "STUDENT")[];
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "TEACHER", "STUDENT"],
  },
  {
    name: "Courses",
    href: "/courses",
    icon: BookOpen,
    roles: ["ADMIN", "TEACHER", "STUDENT"],
  },
  {
    name: "Lessons",
    href: "/lessons",
    icon: FileText,
    roles: ["ADMIN", "TEACHER", "STUDENT"],
  },
  {
    name: "Tests",
    href: "/tests",
    icon: TestTube,
    roles: ["ADMIN", "TEACHER", "STUDENT"],
  },
  {
    name: "Flashcards",
    href: "/flashcards",
    icon: CreditCard,
    roles: ["ADMIN", "TEACHER", "STUDENT"],
  },
  {
    name: "My Progress",
    href: "/progress",
    icon: GraduationCap,
    roles: ["STUDENT"],
  },
  {
    name: "My Students",
    href: "/students",
    icon: Users,
    roles: ["TEACHER"],
  },
  {
    name: "Users",
    href: "/users",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    name: "Admin Panel",
    href: "/admin",
    icon: Shield,
    roles: ["ADMIN"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["ADMIN", "TEACHER", "STUDENT"],
  },
];

/**
 * Sidebar - Navigation sidebar with role-based menu items
 */
export function Sidebar({ open, role }: SidebarProps) {
  const pathname = usePathname();

  // Filter nav items based on user role
  const filteredNavItems = role
    ? navItems.filter((item) => item.roles.includes(role))
    : navItems;

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => {}}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-transform duration-300 z-20 ${
          open ? "translate-x-0" : "-translate-x-full"
        } w-64`}
      >
        <nav className="p-4 space-y-2 overflow-y-auto h-full">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#18AA26] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

