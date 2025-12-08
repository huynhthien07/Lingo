import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRoleFromDB, hasPermission } from "@/lib/services/permission.service";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Permission } from "@/lib/types/permission.types";
import { Users } from "lucide-react";

/**
 * Students Page - Teacher's student management
 * Only accessible by TEACHER and ADMIN
 */
export default async function StudentsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = await getUserRoleFromDB(userId);

  // Only TEACHER and ADMIN can access
  if (role !== "TEACHER" && role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout role={role as "ADMIN" | "TEACHER" | "STUDENT"}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-600 mt-2">
            Manage and track your students' progress
          </p>
        </div>

        {/* Students Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Users className="w-16 h-16 mb-4 text-gray-400" />
            <p className="text-lg">Student management coming soon</p>
            <p className="text-sm mt-2">
              View enrolled students, track progress, and provide feedback
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

