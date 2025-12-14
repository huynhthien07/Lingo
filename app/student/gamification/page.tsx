import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { StudentGamificationView } from "@/components/student/gamification/student-gamification-view";

export default async function StudentGamificationPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <StudentGamificationView />;
}

