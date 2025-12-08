"use client";

import { AdminDashboard } from "./AdminDashboard";
import { TeacherDashboard } from "./TeacherDashboard";
import { StudentDashboard } from "./StudentDashboard";

interface DashboardContentProps {
  role: "ADMIN" | "TEACHER" | "STUDENT";
}

/**
 * DashboardContent - Renders role-specific dashboard content
 */
export function DashboardContent({ role }: DashboardContentProps) {
  switch (role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "TEACHER":
      return <TeacherDashboard />;
    case "STUDENT":
      return <StudentDashboard />;
    default:
      return <div>Unknown role</div>;
  }
}

