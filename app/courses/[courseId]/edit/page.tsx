import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRoleFromDB, hasPermission } from "@/lib/services/permission.service";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { CourseForm } from "@/components/features/courses/CourseForm";
import { Permission } from "@/lib/types/permission.types";

interface EditCoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

/**
 * Edit Course Page
 * Only accessible by ADMIN and TEACHER
 */
export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check permission
  const canEdit = await hasPermission(userId, Permission.COURSE_EDIT);
  if (!canEdit) {
    redirect("/courses");
  }

  const role = await getUserRoleFromDB(userId);
  const { courseId } = await params;

  return (
    <DashboardLayout role={role as "ADMIN" | "TEACHER" | "STUDENT"}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
          <p className="text-gray-600 mt-2">
            Update course information
          </p>
        </div>

        <CourseForm mode="edit" courseId={parseInt(courseId)} />
      </div>
    </DashboardLayout>
  );
}

