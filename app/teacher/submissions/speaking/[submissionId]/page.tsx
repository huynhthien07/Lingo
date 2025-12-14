import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SpeakingGradingView } from "@/components/teacher/submissions/speaking-grading-view";

export default async function SpeakingGradingPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { submissionId } = await params;

  return <SpeakingGradingView submissionId={parseInt(submissionId)} />;
}

