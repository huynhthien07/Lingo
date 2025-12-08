import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRoleFromDB } from "@/lib/services/permission.service";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Settings as SettingsIcon } from "lucide-react";

/**
 * Settings Page - User settings
 * Accessible by all roles
 */
export default async function SettingsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Settings Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <SettingsIcon className="w-16 h-16 mb-4 text-gray-400" />
            <p className="text-lg">Settings page coming soon</p>
            <p className="text-sm mt-2">
              Configure your preferences, notifications, and more
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

