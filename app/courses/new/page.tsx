import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRoleFromDB, hasPermission } from "@/lib/services/permission.service";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { CourseForm } from "@/components/features/courses/CourseForm";
import { Permission } from "@/lib/types/permission.types";

/**
 * Create Course Page
 * Only accessible by ADMIN and TEACHER
 */
export default async function CreateCoursePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check permission
  const canCreate = await hasPermission(userId, Permission.COURSE_CREATE);
  if (!canCreate) {
    redirect("/courses");
  }

  const role = await getUserRoleFromDB(userId);

  return (
    <DashboardLayout role={role as "ADMIN" | "TEACHER" | "STUDENT"}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Course</h1>
          <p className="text-gray-600 mt-2">
            Add a new course to the platform
          </p>
        </div>

        <CourseForm mode="create" />
      </div>
    </DashboardLayout>
  );
}

