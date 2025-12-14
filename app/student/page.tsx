import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { StudentDashboardView } from "@/components/student/dashboard/student-dashboard-view";

export default async function StudentDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <StudentDashboardView />;
}

