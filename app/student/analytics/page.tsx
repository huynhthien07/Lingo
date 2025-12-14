import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { StudentAnalyticsView } from "@/components/student/analytics/student-analytics-view";

export default async function StudentAnalyticsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <StudentAnalyticsView />;
}

