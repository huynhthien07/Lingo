import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserRoleFromDB } from "@/lib/services/permission.service";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { DashboardContent } from "@/components/features/dashboard/DashboardContent";

/**
 * Main Dashboard Page
 * Displays role-specific dashboard content
 */
export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = await getUserRoleFromDB(userId);

  return (
    <DashboardLayout role={role as "ADMIN" | "TEACHER" | "STUDENT"}>
      <DashboardContent role={role as "ADMIN" | "TEACHER" | "STUDENT"} />
    </DashboardLayout>
  );
}

