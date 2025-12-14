import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { StudentHistoryView } from "@/components/student/history/student-history-view";

export default async function StudentHistoryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <StudentHistoryView />;
}

