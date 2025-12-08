import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRoleFromDB } from "@/lib/services/permission.service";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { CourseList } from "@/components/features/courses/CourseList";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import Link from "next/link";
import { Plus } from "lucide-react";

/**
 * Courses Page - List all courses (filtered by role)
 * - ADMIN: See all courses
 * - TEACHER: See own courses
 * - STUDENT: See published courses
 */
export default async function CoursesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = await getUserRoleFromDB(userId);

  return (
    <DashboardLayout role={role as "ADMIN" | "TEACHER" | "STUDENT"}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
            <p className="text-gray-600 mt-2">
              {role === "STUDENT"
                ? "Browse and enroll in courses"
                : "Manage your courses"}
            </p>
          </div>

          {/* Create Button - Only for ADMIN and TEACHER */}
          <PermissionGuard permission="COURSE_CREATE">
            <Link
              href="/courses/new"
              className="flex items-center gap-2 px-4 py-2 bg-[#18AA26] text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Course
            </Link>
          </PermissionGuard>
        </div>

        {/* Course List */}
        <CourseList role={role as "ADMIN" | "TEACHER" | "STUDENT"} />
      </div>
    </DashboardLayout>
  );
}

