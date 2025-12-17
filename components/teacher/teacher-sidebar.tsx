"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  GraduationCap,
  Dumbbell,
  Users,
  ClipboardCheck,
  FileCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    href: "/teacher",
    icon: LayoutDashboard,
  },
  {
    title: "Courses",
    href: "/teacher/courses",
    icon: BookOpen,
  },
  {
    title: "Units",
    href: "/teacher/units",
    icon: FileText,
  },
  {
    title: "Lessons",
    href: "/teacher/lessons",
    icon: GraduationCap,
  },
  {
    title: "Exercises",
    href: "/teacher/exercises",
    icon: Dumbbell,
  },
  {
    title: "Students",
    href: "/teacher/students",
    icon: Users,
  },
  {
    title: "Submissions",
    href: "/teacher/submissions",
    icon: ClipboardCheck,
  },
  {
    title: "Admission Tests",
    href: "/teacher/tests",
    icon: FileCheck,
  },
  {
    title: "Test Grading",
    href: "/teacher/test-submissions",
    icon: ClipboardCheck,
  },
  {
    title: "Flashcards",
    href: "/teacher/flashcards",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/teacher/settings",
    icon: Settings,
  },
];

export function TeacherSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/teacher" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-lg text-gray-800">Lingo</h2>
              <p className="text-xs text-gray-500">Teacher Portal</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50",
                    collapsed && "justify-center"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Toggle Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors w-full",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

