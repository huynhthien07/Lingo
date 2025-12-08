import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRoleFromDB } from "@/lib/services/permission.service";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { TrendingUp } from "lucide-react";

/**
 * Progress Page - Student progress tracking
 * Accessible by STUDENT role
 */
export default async function ProgressPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = await getUserRoleFromDB(userId);

  return (
    <DashboardLayout role={role as "ADMIN" | "TEACHER" | "STUDENT"}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Progress</h1>
          <p className="text-gray-600 mt-2">
            Track your learning journey and achievements
          </p>
        </div>

        {/* Progress Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <TrendingUp className="w-16 h-16 mb-4 text-gray-400" />
            <p className="text-lg">Progress tracking coming soon</p>
            <p className="text-sm mt-2">
              View your completed lessons, test scores, and study streaks
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

