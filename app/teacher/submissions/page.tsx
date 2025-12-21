import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UnifiedSubmissionsList } from "@/components/teacher/unified-submissions-list";

export default async function SubmissionsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <UnifiedSubmissionsList />;
}

