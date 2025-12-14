import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { WritingGradingView } from "@/components/teacher/submissions/writing-grading-view";

export default async function WritingGradingPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { submissionId } = await params;

  return <WritingGradingView submissionId={parseInt(submissionId)} />;
}

