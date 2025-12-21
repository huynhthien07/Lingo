import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TestSpeakingGradingView } from "@/components/teacher/test-speaking-grading-view";

export default async function TestSpeakingGradingPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { submissionId } = await params;

  return <TestSpeakingGradingView submissionId={parseInt(submissionId)} />;
}

