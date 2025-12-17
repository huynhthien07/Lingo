"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  BookOpen,
  CreditCard,
  MessageSquare,
  Trophy,
  History,
  BarChart3,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    href: "/student",
    icon: LayoutDashboard,
  },
  {
    title: "Profile",
    href: "/student/profile",
    icon: User,
  },
  {
    title: "Courses",
    href: "/student/courses",
    icon: BookOpen,
  },
  {
    title: "Tests",
    href: "/student/tests",
    icon: ClipboardList,
  },
  {
    title: "Flashcards",
    href: "/student/flashcards",
    icon: CreditCard,
  },
  {
    title: "Chatbot",
    href: "/student/chatbot",
    icon: MessageSquare,
  },
  {
    title: "Gamification",
    href: "/student/gamification",
    icon: Trophy,
  },
  {
    title: "Learning History",
    href: "/student/learning-history",
    icon: History,
  },
  {
    title: "Analytics",
    href: "/student/analytics",
    icon: BarChart3,
  },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      data-student-sidebar
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/student" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-lg text-gray-800">Lingo</h2>
              <p className="text-xs text-gray-500">Student Portal</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-green-50 text-green-700 font-semibold"
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

