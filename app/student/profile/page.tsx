import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { StudentProfileView } from "@/components/student/profile/student-profile-view";

export default async function StudentProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <StudentProfileView />;
}

