import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRoleFromDB } from "@/lib/services/permission.service";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { CourseDetail } from "@/components/features/courses/CourseDetail";

interface CoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

/**
 * Course Detail Page
 * Shows course information and units
 */
export default async function CoursePage({ params }: CoursePageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = await getUserRoleFromDB(userId);
  const { courseId } = await params;

  return (
    <DashboardLayout role={role as "ADMIN" | "TEACHER" | "STUDENT"}>
      <CourseDetail 
        courseId={parseInt(courseId)} 
        role={role as "ADMIN" | "TEACHER" | "STUDENT"} 
      />
    </DashboardLayout>
  );
}

