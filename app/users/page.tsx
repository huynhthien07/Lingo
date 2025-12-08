import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRoleFromDB, hasPermission } from "@/lib/services/permission.service";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { UserList } from "@/components/features/users/UserList";
import { Permission } from "@/lib/types/permission.types";
import Link from "next/link";
import { Plus } from "lucide-react";

/**
 * Users Page - List all users
 * Only accessible by ADMIN
 */
export default async function UsersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check permission - Only ADMIN can view users
  const canView = await hasPermission(userId, Permission.USER_VIEW);
  if (!canView) {
    redirect("/dashboard");
  }

  const role = await getUserRoleFromDB(userId);

  return (
    <DashboardLayout role={role as "ADMIN" | "TEACHER" | "STUDENT"}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 mt-2">
              Manage all users in the system
            </p>
          </div>

          {/* Create Button */}
          <Link
            href="/users/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#18AA26] text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create User
          </Link>
        </div>

        {/* User List */}
        <UserList />
      </div>
    </DashboardLayout>
  );
}

