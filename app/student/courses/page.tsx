import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { StudentCoursesView } from "@/components/student/courses/student-courses-view";

export default async function StudentCoursesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <StudentCoursesView />;
}

