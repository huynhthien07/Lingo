"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  BookOpen,
  FileCheck,
  CreditCard,
  MessageSquare,
  Trophy,
  History,
  BarChart3,
  GraduationCap,
} from "lucide-react";

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
    title: "Admission Test",
    href: "/student/admission-test",
    icon: FileCheck,
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
    href: "/student/history",
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

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/student" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-800">Lingo</h2>
            <p className="text-xs text-gray-500">Student Portal</p>
          </div>
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-green-50 text-green-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          © 2024 Lingo IELTS
        </div>
      </div>
    </aside>
  );
}

